export const STATUS_LABELS: Record<string, string> = {
  draft: "مسودة",
  submitted: "مُقدَّم",
  sent_to_department: "مُرسل للقسم",
  received_by_department: "مُستلَم من القسم",
  in_progress: "قيد التنفيذ",
  completed: "مُنجَز",
  ready_for_pickup: "جاهز للتسليم",
  delivered: "تم التسليم",
  on_hold: "مُتوقّف",
  cancelled: "ملغى",
};

export const TYPE_LABELS: Record<string, string> = {
  printing: "طباعة",
  design: "تصميم",
  technical: "فني",
  gifts: "هدايا",
};

export const PRIORITY_LABELS: Record<string, string> = {
  normal: "عادي",
  urgent: "عاجل",
};

export const ROLE_LABELS: Record<string, string> = {
  manager: "مدير",
  communication_officer: "مسؤول تواصل",
  department_staff: "موظف قسم",

  // Prisma enums (uppercase)
  MANAGER: "مدير",
  COMMUNICATION_OFFICER: "مسؤول تواصل",
  DEPARTMENT_STAFF: "موظف قسم",
};

export const EVENT_LABELS: Record<string, string> = {
  created: "تسجيل الطلب",
  status_changed: "تغيير الحالة",
  note_added: "ملاحظة",
};
