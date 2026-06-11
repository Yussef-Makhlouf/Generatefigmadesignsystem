import { Helmet } from "react-helmet-async";

// ── Constants ─────────────────────────────────────────────────────────────────
export const SITE_URL = "https://khapeer.com";
export const SITE_NAME = "خبير";
export const SITE_NAME_EN = "Khapeer";
export const DEFAULT_TITLE = "خبير - منصة الأسئلة والأجوبة العربية وتبادل المعرفة";
export const DEFAULT_DESCRIPTION =
  "خبير هي المنصة العربية الأولى لطرح الأسئلة ومشاركة الخبرات مع محترفين وخبراء معتمدين في البرمجة، التقنية، الأعمال، العلوم، والصحة.";
export const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
export const TWITTER_HANDLE = "@khapeer";

// ── Slug generation utility ───────────────────────────────────────────────────
/** Generate a URL-safe slug from Arabic/English text */
export function generateSlug(text: string): string {
  return text
    .trim()
    .replace(/[\s_]+/g, "-")           // spaces/underscores → hyphens
    .replace(/[^\w\u0600-\u06FF\-]/g, "") // keep Arabic, Latin, hyphens
    .replace(/-+/g, "-")               // collapse multiple hyphens
    .replace(/^-|-$/g, "")             // trim leading/trailing hyphens
    .toLowerCase()
    .slice(0, 80);                     // cap length
}

/** Build a canonical question URL */
export function questionUrl(id: string, title?: string): string {
  const slug = title ? generateSlug(title) : "";
  return slug ? `/questions/${id}/${slug}` : `/questions/${id}`;
}

// ── JSON-LD Helpers ───────────────────────────────────────────────────────────

/** WebSite schema with SearchAction (for sitelinks search box) */
export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: SITE_NAME_EN,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    inLanguage: "ar",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Organization schema */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    sameAs: [],
  };
}

/** QAPage schema for question detail pages */
export function qaPageSchema(params: {
  title: string;
  body: string;
  id: string;
  authorName?: string;
  authorUrl?: string;
  dateCreated?: string;
  answers?: Array<{
    body: string;
    authorName?: string;
    authorUrl?: string;
    dateCreated?: string;
    upvoteCount?: number;
    isAccepted?: boolean;
  }>;
  tags?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: params.title,
      text: params.body,
      url: `${SITE_URL}/questions/${params.id}`,
      dateCreated: params.dateCreated || new Date().toISOString(),
      author: params.authorName
        ? {
            "@type": "Person",
            name: params.authorName,
            url: params.authorUrl ? `${SITE_URL}${params.authorUrl}` : undefined,
          }
        : undefined,
      answerCount: params.answers?.length ?? 0,
      ...(params.tags && params.tags.length > 0
        ? { keywords: params.tags.join(", ") }
        : {}),
      suggestedAnswer: (params.answers ?? []).map((a) => ({
        "@type": "Answer",
        text: a.body,
        dateCreated: a.dateCreated || new Date().toISOString(),
        upvoteCount: a.upvoteCount ?? 0,
        ...(a.isAccepted ? { acceptedAnswer: true } : {}),
        author: a.authorName
          ? {
              "@type": "Person",
              name: a.authorName,
              url: a.authorUrl ? `${SITE_URL}${a.authorUrl}` : undefined,
            }
          : undefined,
      })),
    },
  };
}

/** Person schema for profile pages */
export function personSchema(params: {
  name: string;
  username: string;
  bio?: string;
  avatar?: string;
  reputation?: number;
  location?: string;
  website?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: params.name,
    alternateName: `@${params.username}`,
    description: params.bio || `ملف ${params.name} الشخصي على منصة خبير`,
    url: `${SITE_URL}/profile/${params.username}`,
    ...(params.avatar ? { image: params.avatar } : {}),
    ...(params.location ? { address: { "@type": "Place", name: params.location } } : {}),
    ...(params.website ? { sameAs: [params.website] } : {}),
  };
}

/** BreadcrumbList schema */
export function breadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

// ── Main SEO Component ────────────────────────────────────────────────────────

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  image?: string;
  type?: "website" | "article" | "profile";
  /** JSON-LD structured data objects (will be serialized) */
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
  /** Additional meta tags */
  meta?: Array<{ name?: string; property?: string; content: string }>;
}

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  noindex = false,
  image = DEFAULT_IMAGE,
  type = "website",
  structuredData,
  meta = [],
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const canonicalUrl = canonical
    ? canonical.startsWith("http")
      ? canonical
      : `${SITE_URL}${canonical}`
    : undefined;

  const sdArray = structuredData
    ? Array.isArray(structuredData)
      ? structuredData
      : [structuredData]
    : [];

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="ar_AR" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content={TWITTER_HANDLE} />

      {/* Additional meta */}
      {meta.map((m, i) =>
        m.name ? (
          <meta key={i} name={m.name} content={m.content} />
        ) : m.property ? (
          <meta key={i} property={m.property} content={m.content} />
        ) : null
      )}

      {/* JSON-LD Structured Data */}
      {sdArray.map((sd, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(sd)}
        </script>
      ))}
    </Helmet>
  );
}
