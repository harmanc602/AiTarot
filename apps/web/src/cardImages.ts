/**
 * Maps each card's `imageKey` (e.g. `cups01`, `maj00`) to a bundled image URL.
 *
 * Uses Vite's `import.meta.glob` to eagerly import every cropped card image from
 * the shared `assets/img/clean` directory at the repo root. The `@cards` alias
 * (see `vite.config.ts`) points there.
 */
const modules = import.meta.glob<{ default: string }>(
  '../../../assets/img/clean/*.jpg',
  { eager: true },
);

const imageMap: Record<string, string> = {};
for (const [path, mod] of Object.entries(modules)) {
  // ".../clean/cups01.jpg" -> "cups01"
  const key = path.split('/').pop()!.replace('.jpg', '');
  imageMap[key] = mod.default;
}

/** Resolve a card image URL by its `imageKey`. */
export function cardImage(imageKey: string): string {
  const url = imageMap[imageKey];
  if (!url && import.meta.env.DEV) {
    console.warn(`[AiTarot] missing card image for key "${imageKey}"`);
  }
  return url ?? '';
}

export default imageMap;
