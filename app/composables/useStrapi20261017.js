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
  const cfg = useRuntimeConfig()

  // SSR (direct URL visits, hard refreshes, shared links) runs on the
  // Node server and must use the internal URL to dodge hairpin NAT —
  // a server can't always reach its own public domain from inside its
  // own network, even though external clients reach it fine. Client-side
  // navigation runs in the browser and uses the public URL. This split
  // was lost in a later rewrite of this file (the populate/query-string
  // fix below) — restoring it here.
  //
  // strapiUrlInternal is declared at the TOP level of runtimeConfig in
  // nuxt.config.js (server-only, not under `public`), so it must be read
  // as cfg.strapiUrlInternal — cfg.public.strapiUrlInternal is always
  // undefined, which silently sent every SSR fetch to the public domain.
  const url = process.server
    ? (cfg.strapiUrlInternal || cfg.public.strapiUrl)
    : cfg.public.strapiUrl

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

// Published adventures ordered by nextDeparture — soonest-upcoming first,
// then further-future, then past ones last. The ordering itself happens
// server-side (see the adventure.byDeparture controller action), not by
// re-sorting the plain useAdventures() list client-side, so it can't be
// bypassed and stays correct regardless of pagination.
export function useAdventuresByDeparture() {
  return useFetch(() => `${strapiBase()}/api/adventures/by-departure`, {
    key: 'strapi-adventures-by-departure',
    query: { populate: '*' },
    transform: unwrapList,
    default: () => [],
  })
}

// NOTE: previously built the query as an object —
//   query: () => ({ 'filters[slug][$eqi]': unref(slug), populate: '*' })
// — which produced a response missing itinerary/requirements/addons/
// departures/guides (confirmed via a transform-level console.log showing
// raw Strapi data with those keys entirely absent), even though the exact
// same filter+populate combo worked when typed directly into the browser.
// Building the query string by hand, the same way the working manual URL
// was written, avoids however ofetch/useFetch was serializing that object.
export function useAdventure(slug) {
  return useFetch(
    () => `${strapiBase()}/api/adventures?filters[slug][$eqi]=${encodeURIComponent(unref(slug))}&populate=*`,
    {
      key: () => `strapi-adventure-${unref(slug)}`,
      transform: (res) => {
        const match = res?.data?.[0] ?? null
        if (!match) {
          console.warn(
            `[useAdventure] No adventure found for slug "${unref(slug)}". ` +
            `Checked ${res?.meta?.pagination?.total ?? 0} total matches. ` +
            `If this adventure exists in Strapi, confirm it's PUBLISHED ` +
            `(not just saved as a draft) — draft entries don't show via the public API.`
          )
        }
        return match
      },
      watch: [() => unref(slug)],
    }
  )
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
  return useFetch(
    () => `${strapiBase()}/api/stories?filters[slug][$eqi]=${encodeURIComponent(unref(slug))}&populate=*`,
    {
      key: () => `strapi-story-${unref(slug)}`,
      transform: (res) => {
        const match = res?.data?.[0] ?? null
        if (!match) {
          console.warn(`[useStory] No story found for slug "${unref(slug)}" — confirm it's published, not just a draft.`)
        }
        return match
      },
      watch: [() => unref(slug)],
    }
  )
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
// Every field the tracking UI renders maps to a field on the Strapi
// `live-expedition` content type (or its adventure/guide relations and
// trip.* / shared.weather components). Nothing is hardcoded or demo-sourced.
//
// populate is listed explicitly (not '*') so the linked trail's slug —
// needed to match /tracking?trail=<slug> to the right expedition — and the
// guide's role come back, and the query string is built by hand for the
// same serialisation reason noted on useAdventure() above.
const LIVE_EXPEDITION_QUERY = [
  'filters[status][$eq]=active',
  'sort[0]=departureDate:desc',
  'pagination[pageSize]=20',
  'populate[adventure][fields][0]=title',
  'populate[adventure][fields][1]=slug',
  'populate[guide][fields][0]=name',
  'populate[guide][fields][1]=avatar',
  'populate[guide][fields][2]=role',
  'populate[weather]=true',
  'populate[geoRoute]=true',
  'populate[team]=true',
  'populate[checkpoints]=true',
  'populate[feed]=true',
].join('&')

// Strapi decimal/integer fields can arrive as strings depending on the DB
// driver (MySQL decimals do) — Google Maps rejects string lat/lng, and
// toLocaleString() on null crashes SSR, so coerce once here.
const toNum = (v) => (v === null || v === undefined || v === '' ? null : Number(v))

// Checkpoint status → map waypoint status
const CP_TO_ROUTE = { completed: 'done', current: 'current', upcoming: 'upcoming' }
const hasCoords = (p) => Number.isFinite(p.lat) && Number.isFinite(p.lng)

export function normalizeExpedition(e) {
  const adventure = e.adventure || null

  const checkpoints = (e.checkpoints || []).map(c => ({ ...c, lat: toNum(c.lat), lng: toNum(c.lng) }))
  const feed = [...(e.feed || [])]
    .map(f => ({ ...f, lat: toNum(f.lat), lng: toNum(f.lng) }))
    .sort((a, b) => new Date(b.postedAt || 0) - new Date(a.postedAt || 0)) // newest first

  // The map route is the checkpoints that have coordinates. geoRoute is
  // deprecated and only used for older entries whose checkpoints have none.
  const cpRoute = checkpoints
    .filter(hasCoords)
    .map(c => ({ lat: c.lat, lng: c.lng, label: c.name, status: CP_TO_ROUTE[c.status] || 'upcoming' }))
  const legacyRoute = (e.geoRoute || [])
    .map(p => ({ ...p, lat: toNum(p.lat), lng: toNum(p.lng) }))
    .filter(hasCoords)

  // Most recent GPS fix the guide sent with a field post
  const lastFix = feed.find(hasCoords) || null

  return {
    ...e,
    // documentId is Strapi 5's stable public identifier — used for URLs
    key: e.documentId || String(e.id),
    adventure,
    adventureTitle: adventure?.title || e.batchLabel || 'Expedition',
    adventureSlug:  adventure?.slug || null,
    guide: e.guide || null,
    currentDay:       toNum(e.currentDay),
    totalDays:        toNum(e.totalDays),
    participants:     toNum(e.participants) ?? 0,
    maxParticipants:  toNum(e.maxParticipants),
    followers:        toNum(e.followers) ?? 0,
    currentElevation: toNum(e.currentElevation),
    distanceCovered:  toNum(e.distanceCovered) ?? 0,
    totalDistance:    toNum(e.totalDistance),
    elevationGain:    toNum(e.elevationGain),
    elapsedHours:     toNum(e.elapsedHours),
    weather: e.weather || {},
    route: cpRoute.length ? cpRoute : legacyRoute,
    lastFix: lastFix ? { lat: lastFix.lat, lng: lastFix.lng, postedAt: lastFix.postedAt } : null,
    lastFieldUpdateAt: e.lastFieldUpdateAt || null,
    team: e.team || [],
    checkpoints,
    feed,
  }
}

export function useLiveExpeditions() {
  return useFetch(() => `${strapiBase()}/api/live-expeditions?${LIVE_EXPEDITION_QUERY}`, {
    key: 'strapi-live-expeditions',
    transform: (res) => unwrapList(res).map(normalizeExpedition),
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

// ── Loyalty program content (public) ────────────────────────────────────
export function useLoyaltyTiers() {
  return useFetch(() => `${strapiBase()}/api/loyalty-tiers`, {
    key: 'strapi-loyalty-tiers',
    query: { sort: 'order:asc', 'pagination[pageSize]': 50 },
    transform: unwrapList,
    default: () => [],
  })
}

export function useRedeemOptions() {
  return useFetch(() => `${strapiBase()}/api/redeem-options`, {
    key: 'strapi-redeem-options',
    query: { sort: 'order:asc', 'pagination[pageSize]': 50 },
    transform: unwrapList,
    default: () => [],
  })
}

export function useDocumentRequirements() {
  return useFetch(() => `${strapiBase()}/api/document-requirements`, {
    key: 'strapi-document-requirements',
    query: { sort: 'order:asc', 'pagination[pageSize]': 50 },
    transform: unwrapList,
    default: () => [],
  })
}

export function useSiteFeatures() {
  return useFetch(() => `${strapiBase()}/api/site-features`, {
    key: 'strapi-site-features',
    query: { sort: 'order:asc', 'pagination[pageSize]': 50 },
    transform: unwrapList,
    default: () => [],
  })
}

export function useDownloadResources() {
  return useFetch(() => `${strapiBase()}/api/download-resources`, {
    key: 'strapi-download-resources',
    query: { sort: 'order:asc', 'pagination[pageSize]': 50 },
    transform: unwrapList,
    default: () => [],
  })
}

// ── Small helpers used across components ────────────────────────────────
// Adventure titles are stored full; several admin/dashboard tables show a
// shortened "first 3 words…" version — this matches the old demo.js helper.
export function shortTitle(title) {
  if (!title) return ''
  return title.split(' ').slice(0, 3).join(' ') + '…'
}

// Currency comes from the CMS per-adventure (adventure.currency — UGX/USD/
// KES), never hardcoded. UGX/KES conventionally show as a code prefix
// (e.g. "UGX 150,000"); USD gets the $ symbol. Falls back to UGX if an
// adventure has no currency set (shouldn't happen once every entry has
// been resaved against the schema's new required field with its default).
const CURRENCY_DISPLAY = {
  USD: { symbol: '$', position: 'prefix' },
  UGX: { symbol: 'UGX', position: 'prefix-spaced' },
  KES: { symbol: 'KES', position: 'prefix-spaced' },
}

export function formatMoney(amount, currency) {
  const value = (amount ?? 0).toLocaleString()
  const cfg = CURRENCY_DISPLAY[currency] || CURRENCY_DISPLAY.UGX
  return cfg.position === 'prefix' ? `${cfg.symbol}${value}` : `${cfg.symbol} ${value}`
}