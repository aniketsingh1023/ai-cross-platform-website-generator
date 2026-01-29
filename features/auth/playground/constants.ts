export const TEMPLATE_TYPES = [
  "REACT",
  "NEXTJS",
  "EXPRESS",
  "VUE",
  "ANGULAR",
  "HONO",
  "SVELTE",
  "ASTRO",
  "SOLIDJS",
  "THREEJS",
] as const;

export type TemplateType = typeof TEMPLATE_TYPES[number];
