export const TEMPLATE_TYPES = [
  "REACT",
  "NEXTJS",
  "EXPRESS",
  "VUE",
  "ANGULAR",
  "HONO",
] as const;

export type TemplateType = typeof TEMPLATE_TYPES[number];
