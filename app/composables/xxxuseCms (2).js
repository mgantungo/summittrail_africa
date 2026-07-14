// app/composables/useStrapi.js
//
// Public-content composables — hit the Strapi CMS directly since these
// collections have public find/findOne permissions enabled (see the CMS
// bootstrap function). Everything here is read-only from the browser.
//
// Requires in your Nuxt .env:
//   NUXT_PUBLIC_STRAPI_URL=http://localhost:1337

// Hard fallback so a broken/missing runtimeConfig can never produce a
// URL like "undefined/api/adventures" — worst case we hit the known
// production CMS instead of silently building a bad URL.
const FALLBACK_STRAPI_URL = 'https://cms.summittrail.visiongroup.co.ug'

let warned = false
function strapiBase() {
  const url = useRuntimeConfig().public.strapiUrl
  if (!url) {
    if (!warned) {
      console.warn(
        '[useStrapi] runtimeConfig.public.strapiUrl is not set — ' +
        'falling back to', FALLBACK_STRAPI_URL,
        '. Check NUXT_PUBLIC_STRAPI_URL in your .env and restart the dev server.'
      )
      warned = true
    }
    return FALLBACK_STRAPI_URL
  }
  return url
}

function unwrapList(res) {
  return res?.data ?? []
}
function unwrapOne(res) {
  return res?.data?.[0] ?? null
}

// ── Adventures ───────────────────────────────────────────────────────────
export function useAdventures() {
  return useFetch(() => `${strapiBase()}/api/adventures`, {
    key: 'strapi-adventures',
    query: { populate: '*', 'pagination[pageSize]': 100, sort: 'title:asc' },
    transform: unwrapList,
    default: () => [],
  })
}

export function useAdventure(slug) {
  return useFetch(() => `${strapiBase()}/api/adventures`, {
    key: () => `strapi-adventure-${unref(slug)}`,
    query: () => ({ 'filters[slug][$eq]': unref(slug), populate: '*' }),
    transform: unwrapOne,
    watch: [() => unref(slug)],
  })
}

// ── Guides ───────────────────────────────────────────────────────────────
export function useGuides() {
  return useFetch(() => `${strapiBase()}/api/guides`, {
    key: 'strapi-guides',
    query: { populate: '*', 'pagination[pageSize]': 100 },
    transform: unwrapList,
    default: () => [],
  })
}

// ── Vehicles ─────────────────────────────────────────────────────────────
export function useVehicles() {
  return useFetch(() => `${strapiBase()}/api/vehicles`, {
    key: 'strapi-vehicles',
    query: { 'pagination[pageSize]': 100 },
    transform: unwrapList,
    default: () => [],
  })
}

// ── Stories ──────────────────────────────────────────────────────────────
export function useStories() {
  return useFetch(() => `${strapiBase()}/api/stories`, {
    key: 'strapi-stories',
    query: { populate: '*', 'pagination[pageSize]': 100, sort: 'publishDate:desc' },
    transform: unwrapList,
    default: () => [],
  })
}

export function useStory(slug) {
  return useFetch(() => `${strapiBase()}/api/stories`, {
    key: () => `strapi-story-${unref(slug)}`,
    query: () => ({ 'filters[slug][$eq]': unref(slug), populate: '*' }),
    transform: unwrapOne,
    watch: [() => unref(slug)],
  })
}

// ── Reviews ──────────────────────────────────────────────────────────────
export function useReviews(adventureSlug) {
  return useFetch(() => `${strapiBase()}/api/reviews`, {
    key: () => `strapi-reviews-${unref(adventureSlug) || 'all'}`,
    query: () => ({
      populate: '*',
      'pagination[pageSize]': 100,
      ...(unref(adventureSlug) ? { 'filters[adventure][slug][$eq]': unref(adventureSlug) } : {}),
    }),
    transform: unwrapList,
    default: () => [],
    watch: [() => unref(adventureSlug)],
  })
}

// ── Live expeditions ─────────────────────────────────────────────────────
export function useLiveExpeditions() {
  return useFetch(() => `${strapiBase()}/api/live-expeditions`, {
    key: 'strapi-live-expeditions',
    query: { populate: '*', 'filters[status][$eq]': 'active', 'pagination[pageSize]': 20 },
    transform: unwrapList,
    default: () => [],
  })
}

// ── Analytics snapshot (single type, public) ────────────────────────────
export function useAnalyticsSnapshot() {
  return useFetch(() => `${strapiBase()}/api/analytics-snapshot`, {
    key: 'strapi-analytics-snapshot',
    query: { populate: '*' },
    transform: (res) => res?.data ?? null,
  })
}

// ── Public write actions ────────────────────────────────────────────────
export async function subscribeToNewsletter({ email, name, source }) {
  return $fetch(`${strapiBase()}/api/newsletter-subscribers`, {
    method: 'POST',
    body: { data: { email, name, source, status: 'subscribed', subscribedAt: new Date().toISOString() } },
  })
}

export async function submitContactMessage({ name, email, subject, message }) {
  return $fetch(`${strapiBase()}/api/contact-messages`, {
    method: 'POST',
    body: { data: { name, email, subject, message, status: 'new', receivedAt: new Date().toISOString() } },
  })
}

// ── Small helpers used across components ────────────────────────────────
// Adventure titles are stored full; several admin/dashboard tables show a
// shortened "first 3 words…" version — this matches the old demo.js helper.
export function shortTitle(title) {
  if (!title) return ''
  return title.split(' ').slice(0, 3).join(' ') + '…'
}