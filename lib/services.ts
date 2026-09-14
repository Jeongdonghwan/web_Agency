import { loadCollection, findByUrlSlug, PageDoc } from './collection';

let cache: PageDoc[] | null = null;

export function getAllServices(): PageDoc[] {
  if (!cache) cache = loadCollection('services');
  return cache;
}

export const getServiceByUrlSlug = (urlSlug: string) => findByUrlSlug(getAllServices(), urlSlug);
export const getServiceBySlug = (slug: string) => getAllServices().find((d) => d.slug === slug);

export const servicePath = (d: { urlSlug: string }) => `/service/${d.urlSlug}/`;
export const serviceEncodedPath = (d: { urlSlug: string }) => `/service/${encodeURIComponent(d.urlSlug)}/`;
