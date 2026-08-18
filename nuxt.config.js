// nuxt.config.js
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  future: { compatibilityVersion: 4 },

  devtools: { enabled: true },

  modules: ['@pinia/nuxt'],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
  // ── Server-only secrets (never exposed to browser) ──
  vapidPrivateKey:    process.env.VAPID_PRIVATE_KEY,
  analyticsSecret:    process.env.ANALYTICS_SECRET,
  smtpHost:           process.env.SMTP_HOST,
  smtpPort:           process.env.SMTP_PORT,
  smtpUser:           process.env.SMTP_USER,
  smtpPass:           process.env.SMTP_PASS,
  newsletterFrom:     process.env.NEWSLETTER_FROM,
  newsletterFromName: process.env.NEWSLETTER_FROM_NAME,
  stripeSecretKey:    process.env.STRIPE_SECRET_KEY,
  strapiApiToken:     process.env.STRAPI_API_TOKEN,   // NEW — server-only CMS token
  strapiUrlInternal:  process.env.STRAPI_URL_INTERNAL, // NEW — local URL for server-side CMS calls (avoids hairpin NAT)

  public: {
    appName:     process.env.NUXT_PUBLIC_APP_NAME     || 'Summit Trail Limited',
    appUrl:      process.env.NUXT_PUBLIC_APP_URL      || 'http://localhost:3250',
    appVersion:  process.env.NUXT_PUBLIC_APP_VERSION  || '1.0.0',
    googleMapsKey: process.env.NUXT_PUBLIC_GOOGLE_MAPS_KEY || '',
    vapidPublicKey: process.env.NUXT_PUBLIC_VAPID_PUBLIC_KEY || '',
    geoApiUrl:          process.env.NUXT_PUBLIC_GEO_API_URL || 'http://ip-api.com/json',
    googleAnalyticsId:  process.env.GOOGLE_ANALYTICS_ID    || '',
    stripePublicKey: process.env.STRIPE_PUBLIC_KEY || '',
    adminEmail:    process.env.NUXT_PUBLIC_ADMIN_EMAIL    || 'admin@summittrail.ug',
    adminPassword: process.env.NUXT_PUBLIC_ADMIN_PASSWORD || 'SummitTrail2025!',

    // NEW — CMS base URL, public because the browser reads adventures/
    // guides/vehicles/stories/reviews/live-expeditions directly from it
    strapiUrl: process.env.NUXT_PUBLIC_STRAPI_URL || 'https://cms.summittrail.visiongroup.co.ug'
  }
},

  // ── Dev server ───────────────────────────────────────
  devServer: {
    port: process.env.PORT || 3250,
    host: process.env.HOST || 'localhost',
  },

  server: {
    port:  process.env.PORT || 3250,
    host:  '0.0.0.0',
  },

  // ── App head ─────────────────────────────────────────
  app: {
    head: {
      title: 'Summit Trail Limited – Push Beyond Limits',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport',     content: 'width=device-width, initial-scale=1' },
        { name: 'description',  content: "Uganda's premier extreme adventure platform – overland expeditions, survival challenges, mountain climbing, convoy adventures." },
        { name: 'theme-color',  content: '#e8622a' },
        { property: 'og:title',       content: 'Summit Trail Limited' },
        { property: 'og:description', content: "Push Beyond Limits – Uganda's gateway to life-defining adventures." },
        { property: 'og:image',       content: '/images/og-cover.jpg' },
        { property: 'og:type',        content: 'website' },
      ],
      link: [
        { rel: 'icon',     type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'manifest', href: '/manifest.json' },
        {
          rel:  'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:ital,wght@0,300;0,400;0,500;1,300&display=swap',
        }
      ],
      script: [
        { src: '/sw-register.js', defer: true }
      ]
    }
  },

  // ── Vite ─────────────────────────────────────────────
  vite: {
    server: {
      watch: {
        // Polling prevents Vite fs-watcher crashes on Windows
        usePolling: process.platform === 'win32',
        interval:   300,
      },
      allowedHosts: [
        'summittrail.africa.newvision.co.ug',
        'summittrail.africa',
        '.summittrail.africa',
        '.newvision.co.ug',
        'localhost',
      ],
    },
    preview: {
      allowedHosts: [
        'pikanza.newvision.co.ug',
        '.newvision.co.ug',
        'summittrail.africa',
        'localhost',
        'cms.summittrail.visiongroup.co.ug'
      ]
    }
  },

  // ── Route rules ───────────────────────────────────────
  routeRules: {
    '/admin/**':     { ssr: false },
    '/dashboard/**': { ssr: false },
  },

  // ── Nitro ─────────────────────────────────────────────
  nitro: {
    security: {
      headers: {
        // Allow embeds (needed for Google Maps iframes and YouTube stories)
        crossOriginEmbedderPolicy: 'unsafe-none',

        contentSecurityPolicy: {
          /*
           * style-src:
           *   'self'          — Nuxt/Vite component CSS bundles
           *   'unsafe-inline' — Vite dev-mode injects <style> tags via JS
           *   fonts.googleapis.com — Google Fonts stylesheet
           */
          'style-src': [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
          ],

          /*
           * font-src:
           *   fonts.gstatic.com — actual font files served by Google
           */
          'font-src': [
            "'self'",
            'https://fonts.gstatic.com',
          ],

          /*
           * script-src:
           *   'unsafe-inline' + 'unsafe-eval' required by Vite HMR in dev
           *   maps.googleapis.com — Google Maps JS API
           *   maps.gstatic.com   — Google Maps helper scripts
           */
          'script-src': [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            'https://maps.googleapis.com',
            'https://maps.gstatic.com',
          ],

          /*
           * img-src:
           *   https: — allows all HTTPS images (Unsplash, Google Maps tiles, avatars)
           *   data:  — allows base64-encoded images
           *   maps.gstatic.com / maps.googleapis.com — map tiles and Street View
           */
          'img-src': [
            "'self'",
            'data:',
            'https:',
            'https://maps.gstatic.com',
            'https://maps.googleapis.com',
          ],

          /*
           * connect-src:
           *   Self + production domains
           *   cms.summittrail.visiongroup.co.ug — Strapi CMS (public content reads)
           *   maps.googleapis.com — Google Maps API calls
           *   fonts.googleapis.com — font metadata requests
           *   (ip-api.com removed — geo lookup now runs server-side via
           *   /api/analytics/geo, so the browser never calls it directly)
           */
          'connect-src': [
            "'self'",
            'https://summittrail.africa',
            'https://summittrail.africa.newvision.co.ug',
            'http://summittrail.africa.newvision.co.ug',
            'https://*.newvision.co.ug',
            'https://cms.summittrail.visiongroup.co.ug',
            'https://maps.googleapis.com',
            'https://fonts.googleapis.com',
          ],

          /*
           * frame-src:
           *   maps.google.com — Google Maps embeds
           *   youtube.com     — story video embeds
           */
          'frame-src': [
            "'self'",
            'https://www.google.com',
            'https://maps.google.com',
            'https://www.youtube.com',
          ],

          // worker-src: service worker
          'worker-src': ["'self'", 'blob:'],
        }
      }
    }
  },

  telemetry: false,
})