// server/utils/live-image.js — auto-imported by Nitro.
//
// Turns a participant's photo into the 700×700 watermarked JPEG that goes
// on the live feed:
//   1. checks the real format from the file bytes (JPEG / PNG / WEBP only)
//   2. applies EXIF orientation, then drops ALL metadata (the phone's EXIF
//      GPS/serial never reaches the public; we store the post's GPS ourselves)
//   3. smart-crops to a 700×700 square (attention strategy) with Lanczos3
//      and a light sharpen so detail survives the downsample
//   4. composites the Summit Trail logo (server/assets/live-watermark.png)
//      bottom-right and a "LIVE · date · coordinates" caption bottom-left
//   5. encodes high-quality JPEG (mozjpeg, 4:4:4 chroma)

import sharp from 'sharp'

export const LIVE_SIZE = 700
export const LIVE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']
const FORMATS = ['jpeg', 'png', 'webp']
const MARGIN = 18

let watermarkCache = null
async function loadWatermark() {
  if (watermarkCache !== null) return watermarkCache
  try {
    const raw = await useStorage('assets:server').getItemRaw('live-watermark.png')
    watermarkCache = raw ? Buffer.from(raw) : false
  } catch {
    watermarkCache = false
  }
  if (!watermarkCache) console.warn('[live-image] server/assets/live-watermark.png missing — using text watermark only')
  return watermarkCache
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

function coordLabel(lat, lng) {
  const ns = lat >= 0 ? 'N' : 'S'
  const ew = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(4)}°${ns} ${Math.abs(lng).toFixed(4)}°${ew}`
}

// Bottom gradient + caption. If the server has no fonts the text simply
// doesn't draw; the logo watermark still applies.
function captionSvg({ lat, lng, when, withLogo }) {
  const date = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Kampala', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(when)
  const line = `${date} EAT · ${coordLabel(lat, lng)}`
  const brand = withLogo ? '' : `<text x="${LIVE_SIZE - MARGIN}" y="${LIVE_SIZE - MARGIN}" text-anchor="end" font-family="DejaVu Sans, Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#ffffff" fill-opacity="0.9">SUMMIT TRAIL</text>`
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${LIVE_SIZE}" height="${LIVE_SIZE}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/>
  </linearGradient></defs>
  <rect x="0" y="${LIVE_SIZE - 120}" width="${LIVE_SIZE}" height="120" fill="url(#g)"/>
  <rect x="${MARGIN}" y="${LIVE_SIZE - MARGIN - 44}" width="46" height="18" fill="#e8622a"/>
  <text x="${MARGIN + 23}" y="${LIVE_SIZE - MARGIN - 30}" text-anchor="middle" font-family="DejaVu Sans, Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="#0a0a08">LIVE</text>
  <text x="${MARGIN}" y="${LIVE_SIZE - MARGIN - 4}" font-family="DejaVu Sans, Arial, Helvetica, sans-serif" font-size="14" fill="#ffffff" fill-opacity="0.92">${esc(line)}</text>
  ${brand}
</svg>`)
}

/**
 * @param {Buffer} input  uploaded file bytes
 * @param {{ lat:number, lng:number, when?:Date }} opts
 * @returns {Promise<Buffer>} 700×700 watermarked JPEG
 */
export async function processLivePhoto(input, { lat, lng, when = new Date() }) {
  let meta
  try {
    meta = await sharp(input, { limitInputPixels: 60_000_000 }).metadata()
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'That file is not a readable image' })
  }
  if (!FORMATS.includes(meta.format)) {
    throw createError({ statusCode: 400, statusMessage: 'Only .jpg, .jpeg, .png or .webp photos' })
  }
  if ((meta.width || 0) < 300 || (meta.height || 0) < 300) {
    throw createError({ statusCode: 400, statusMessage: 'Photo is too small — at least 300×300 px' })
  }

  const square = await sharp(input, { limitInputPixels: 60_000_000, animated: false })
    .rotate() // honour EXIF orientation; metadata is not carried over
    .resize(LIVE_SIZE, LIVE_SIZE, { fit: 'cover', position: sharp.strategy.attention, kernel: 'lanczos3' })
    .flatten({ background: '#0a0a08' }) // transparent PNG/WEBP → brand black
    .sharpen({ sigma: 0.6, m1: 0.5, m2: 1.5 })
    .toBuffer()

  const logo = await loadWatermark()
  const layers = [{ input: captionSvg({ lat, lng, when, withLogo: !!logo }), left: 0, top: 0 }]
  if (logo) {
    const { width = 0, height = 0 } = await sharp(logo).metadata()
    layers.push({ input: logo, left: LIVE_SIZE - width - MARGIN + 8, top: LIVE_SIZE - height - MARGIN + 8 })
  }

  return sharp(square)
    .composite(layers)
    .jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toBuffer()
}
