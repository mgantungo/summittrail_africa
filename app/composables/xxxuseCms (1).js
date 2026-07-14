// app/composables/useCms.js
//
// Composables for the collections that are NOT publicly readable
// (bookings, customers, payments, documents, notifications,
// summit-point-transactions). These go through the Nuxt server proxy at
// /api/cms/* so the Strapi API token never reaches the browser.
// See server/api/cms/[...path].js.

function unwrapList(res) {
  return res?.data ?? []
}

// ── Bookings ─────────────────────────────────────────────────────────────
export function useBookings(opts = {}) {
  return useFetch('/api/cms/bookings', {
    key: `cms-bookings-${opts.key || 'all'}`,
    query: { populate: '*', 'pagination[pageSize]': 200, sort: 'bookedAt:desc', ...opts.query },
    transform: unwrapList,
    default: () => [],
  })
}

export function useCustomerBookings(customerEmail) {
  return useFetch('/api/cms/bookings', {
    key: () => `cms-bookings-customer-${unref(customerEmail)}`,
    query: () => ({
      populate: '*',
      'filters[customer][email][$eq]': unref(customerEmail),
      sort: 'bookedAt:desc',
    }),
    transform: unwrapList,
    default: () => [],
    watch: [() => unref(customerEmail)],
  })
}

// ── Customers ────────────────────────────────────────────────────────────
export function useCustomers() {
  return useFetch('/api/cms/customers', {
    key: 'cms-customers',
    query: { populate: '*', 'pagination[pageSize]': 200 },
    transform: unwrapList,
    default: () => [],
  })
}

// ── Payments ─────────────────────────────────────────────────────────────
export function usePayments(opts = {}) {
  return useFetch('/api/cms/payments', {
    key: `cms-payments-${opts.key || 'all'}`,
    query: { populate: '*', 'pagination[pageSize]': 200, ...opts.query },
    transform: unwrapList,
    default: () => [],
  })
}

// ── Documents ────────────────────────────────────────────────────────────
export function useCustomerDocuments(customerEmail) {
  return useFetch('/api/cms/documents', {
    key: () => `cms-documents-${unref(customerEmail)}`,
    query: () => ({ populate: '*', 'filters[customer][email][$eq]': unref(customerEmail) }),
    transform: unwrapList,
    default: () => [],
    watch: [() => unref(customerEmail)],
  })
}

// ── Notifications ────────────────────────────────────────────────────────
export function useCustomerNotifications(customerEmail) {
  return useFetch('/api/cms/notifications', {
    key: () => `cms-notifications-${unref(customerEmail)}`,
    query: () => ({ 'filters[customer][email][$eq]': unref(customerEmail), sort: 'sentAt:desc' }),
    transform: unwrapList,
    default: () => [],
    watch: [() => unref(customerEmail)],
  })
}

// ── Summit Points ledger ─────────────────────────────────────────────────
export function useSummitPointTransactions(customerEmail) {
  return useFetch('/api/cms/summit-point-transactions', {
    key: () => `cms-points-${unref(customerEmail)}`,
    query: () => ({ 'filters[customer][email][$eq]': unref(customerEmail), sort: 'transactionDate:desc' }),
    transform: unwrapList,
    default: () => [],
    watch: [() => unref(customerEmail)],
  })
}
