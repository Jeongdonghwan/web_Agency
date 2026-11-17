import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION } from '../../lib/site';
import { getGuides, guidePath, encPath } from '../../lib/content';

export const dynamic = 'force-static';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export async function GET() {
  const items = getGuides()
    .map((g) => {
      const url = `${SITE_URL}${encPath(guidePath(g.slug))}`;
      return `    <item>\n      <title>${esc(g.title)}</title>\n      <link>${url}</link>\n      <guid isPermaLink="true">${url}</guid>\n      <description>${esc(g.description)}</description>\n      <pubDate>${new Date(g.updatedAt).toUTCString()}</pubDate>\n    </item>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>${esc(SITE_NAME)}</title>\n    <link>${SITE_URL}/</link>\n    <description>${esc(DEFAULT_DESCRIPTION)}</description>\n    <language>ko</language>\n${items}\n  </channel>\n</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
