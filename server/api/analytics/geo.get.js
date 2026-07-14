// server/api/analytics/geo.get.js
//
// Proxies the ip-api.com geo lookup server-side. Browsers block direct
// client-side calls to http://ip-api.com from an HTTPS page ("mixed
// content"), but server-to-server HTTP requests aren't subject to that
// restriction — the browser only ever talks to this same-origin HTTPS
// endpoint.
//
// Uses the requesting visitor's own IP (from the request headers) rather
// than the server's IP, since ip-api.com would otherwise geolocate the
// server itself when called this way.

export default defineEventHandler(async (event) => {
  const forwarded = getHeader(event, 'x-forwarded-for')
  const visitorIp = forwarded ? forwarded.split(',')[0].trim() : getRequestIP(event, { xForwardedFor: true })

  // Local/dev IPs won't resolve to anything meaningful — just skip.
  if (!visitorIp || visitorIp === '::1' || visitorIp.startsWith('127.') || visitorIp.startsWith('192.168.') || visitorIp.startsWith('10.')) {
    return { status: 'fail', message: 'local/private IP' }
  }

  try {
    return await $fetch(`http://ip-api.com/json/${visitorIp}`, {
      query: { fields: 'status,message,country,city,regionName,countryCode,query' },
    })
  } catch (err) {
    return { status: 'fail', message: 'geo lookup failed' }
  }
})