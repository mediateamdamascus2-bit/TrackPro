/** Maps request type to department slug (must match `departments.slug` in DB). */
export const REQUEST_TYPE_SLUGS = [
  "printing",
  "design",
  "technical",
  "gifts",
] as const;

export type RequestTypeSlug = (typeof REQUEST_TYPE_SLUGS)[number];

export function departmentSlugForRequestType(
  type: RequestTypeSlug,
): RequestTypeSlug {
  return type;
}
