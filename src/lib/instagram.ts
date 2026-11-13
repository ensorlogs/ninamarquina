import "server-only";
import staticPosts from "@/data/instagram.json";

export type IgPost = { image: string; href: string };

type BeholdPost = {
  id: string;
  mediaType: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  permalink: string;
  sizes?: { large?: { mediaUrl?: string }; medium?: { mediaUrl?: string }; small?: { mediaUrl?: string } };
};

type BeholdFeed = { posts?: BeholdPost[] };

const LIMIT = 6;

// Prefer Behold's own CDN (behold.pictures): permanent URLs, unlike Instagram's
// scontent URLs which carry short-lived signatures.
const imageFor = (p: BeholdPost) =>
  p.sizes?.large?.mediaUrl ??
  p.sizes?.medium?.mediaUrl ??
  p.sizes?.small?.mediaUrl ??
  (p.mediaType === "VIDEO" ? p.thumbnailUrl : undefined) ??
  p.mediaUrl ??
  p.thumbnailUrl;

/**
 * Latest Instagram posts via Behold (free tier). Falls back to the static
 * snapshot in data/instagram.json if BEHOLD_FEED_URL is missing or the feed
 * errors, so the section never renders empty.
 */
export async function getInstagramPosts(): Promise<IgPost[]> {
  const url = process.env.BEHOLD_FEED_URL;
  if (!url) return staticPosts as IgPost[];
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return staticPosts as IgPost[];
    const feed = (await res.json()) as BeholdFeed;
    const posts = (feed.posts ?? [])
      .map((p) => ({ image: imageFor(p), href: p.permalink }))
      .filter((p): p is IgPost => !!p.image && !!p.href)
      .slice(0, LIMIT);
    return posts.length ? posts : (staticPosts as IgPost[]);
  } catch {
    return staticPosts as IgPost[];
  }
}
