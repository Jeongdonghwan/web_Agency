import { loadCollection, findByUrlSlug, PageDoc } from './collection';

let cache: PageDoc[] | null = null;

export function getAllRegions(): PageDoc[] {
  if (!cache) cache = loadCollection('regions');
  return cache;
}

export const getRegionByUrlSlug = (urlSlug: string) => findByUrlSlug(getAllRegions(), urlSlug);
export const getRegionBySlug = (slug: string) => getAllRegions().find((d) => d.slug === slug);

export const regionPath = (d: { urlSlug: string }) => `/region/${d.urlSlug}/`;
export const regionEncodedPath = (d: { urlSlug: string }) => `/region/${encodeURIComponent(d.urlSlug)}/`;
