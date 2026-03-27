-- TrackPro: departments, profiles, requests, timeline, notifications, attachments
-- Apply in Supabase: SQL Editor → run once, or `supabase db push` with CLI.

-- -----------------------------------------------------------------------------
-- Departments (seeded; managers can maintain later)
-- -----------------------------------------------------------------------------
CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.departments (slug, name_ar, sort_order) VALUES
  ('printing', 'الطباعة', 1),
  ('design', 'التصميم', 2),
  ('technical', 'الفني', 3),
  ('gifts', 'الهدايا', 4);

-- -----------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- -----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'department_staff'
    CHECK (role IN ('communication_officer', 'department_staff', 'manager')),
  department_id uuid REFERENCES public.departments (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
BEGIN
  v_role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'department_staff');
  IF v_role NOT IN ('communication_officer', 'department_staff', 'manager') THEN
    v_role := 'department_staff';
  END IF;

  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    v_role
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Requests
-- -----------------------------------------------------------------------------
CREATE TABLE public.requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number bigserial UNIQUE NOT NULL,
  organization_name text NOT NULL,
  contact_phone text,
  description text NOT NULL,
  request_type_slug text NOT NULL
    CHECK (request_type_slug IN ('printing', 'design', 'technical', 'gifts')),
  department_id uuid NOT NULL REFERENCES public.departments (id),
  status text NOT NULL DEFAULT 'submitted'
    CHECK (status IN (
      'draft', 'submitted', 'sent_to_department', 'received_by_department',
      'in_progress', 'completed', 'ready_for_pickup', 'delivered', 'on_hold', 'cancelled'
    )),
  due_at timestamptz,
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent')),
  hold_reason text,
  internal_notes text,
  created_by uuid NOT NULL REFERENCES public.profiles (id),
  received_by_department_at timestamptz,
  completed_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX requests_department_id_idx ON public.requests (department_id);
CREATE INDEX requests_status_idx ON public.requests (status);
CREATE INDEX requests_due_at_idx ON public.requests (due_at);
CREATE INDEX requests_created_at_idx ON public.requests (created_at DESC);

CREATE TRIGGER requests_updated_at
  BEFORE UPDATE ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Timeline / audit
-- -----------------------------------------------------------------------------
CREATE TABLE public.request_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.requests (id) ON DELETE CASCADE,
  event_type text NOT NULL,
  actor_id uuid REFERENCES public.profiles (id),
  payload jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX request_events_request_id_idx ON public.request_events (request_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- File metadata (binary files live in Storage)
-- -----------------------------------------------------------------------------
CREATE TABLE public.request_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.requests (id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  uploaded_by uuid NOT NULL REFERENCES public.profiles (id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX request_attachments_request_id_idx ON public.request_attachments (request_id);

-- -----------------------------------------------------------------------------
-- In-app notifications
-- -----------------------------------------------------------------------------
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  request_id uuid REFERENCES public.requests (id) ON DELETE CASCADE,
  type text NOT NULL,
  title text,
  body text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notifications_user_id_idx ON public.notifications (user_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- Storage bucket (files)
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', false)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Departments: readable by any signed-in user; full access for managers
CREATE POLICY departments_select_authenticated
  ON public.departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY departments_write_manager
  ON public.departments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'manager'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'manager'
    )
  );

-- Profiles
CREATE POLICY profiles_select
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('manager', 'communication_officer')
    )
  );

CREATE POLICY profiles_update_self
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY profiles_update_manager
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'manager'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'manager'
    )
  );

-- Requests visibility
CREATE POLICY requests_select
  ON public.requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (
          p.role IN ('manager', 'communication_officer')
          OR (p.role = 'department_staff' AND p.department_id = requests.department_id)
        )
    )
  );

CREATE POLICY requests_insert
  ON public.requests FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('communication_officer', 'manager')
    )
  );

CREATE POLICY requests_update
  ON public.requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (
          p.role IN ('manager', 'communication_officer')
          OR (p.role = 'department_staff' AND p.department_id = requests.department_id)
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (
          p.role IN ('manager', 'communication_officer')
          OR (p.role = 'department_staff' AND p.department_id = requests.department_id)
        )
    )
  );

-- Timeline
CREATE POLICY request_events_select
  ON public.request_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.requests r
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE r.id = request_events.request_id
        AND (
          p.role IN ('manager', 'communication_officer')
          OR (p.role = 'department_staff' AND p.department_id = r.department_id)
        )
    )
  );

CREATE POLICY request_events_insert
  ON public.request_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.requests r
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE r.id = request_events.request_id
        AND (
          p.role IN ('manager', 'communication_officer')
          OR (p.role = 'department_staff' AND p.department_id = r.department_id)
        )
    )
  );

-- Attachments (same visibility as request)
CREATE POLICY request_attachments_select
  ON public.request_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.requests r
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE r.id = request_attachments.request_id
        AND (
          p.role IN ('manager', 'communication_officer')
          OR (p.role = 'department_staff' AND p.department_id = r.department_id)
        )
    )
  );

CREATE POLICY request_attachments_insert
  ON public.request_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.requests r
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE r.id = request_attachments.request_id
        AND (
          p.role IN ('manager', 'communication_officer')
          OR (p.role = 'department_staff' AND p.department_id = r.department_id)
        )
    )
  );

-- Notifications: read own; officers/managers can create for any user (internal tool)
CREATE POLICY notifications_select_own
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY notifications_update_own
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY notifications_insert_staff
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('communication_officer', 'manager')
    )
  );

-- Storage: attachments bucket (tighten paths in a later migration)
CREATE POLICY attachments_select
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'attachments');

CREATE POLICY attachments_insert
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'attachments');

CREATE POLICY attachments_update
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'attachments')
  WITH CHECK (bucket_id = 'attachments');

CREATE POLICY attachments_delete
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'attachments');
