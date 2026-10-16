// scripts/test-summit-email.mjs
//
// Sends one test email through Summit Trail's SMTP mailbox, using the same
// service the site uses for follower notifications. Reads SUMMIT_SMTP_* from .env.
//
//   node --no-warnings --env-file=.env scripts/test-summit-email.mjs you@example.com
//
// (Node 20.6+ for --env-file. Run from the Nuxt project root.)

import { summitTrailEmail } from '../server/utils/summit-trail-email.js'

const to = process.argv[2]
if (!to) {
  console.error('Usage: node --no-warnings --env-file=.env scripts/test-summit-email.mjs you@example.com')
  process.exit(1)
}
if (!summitTrailEmail.configured) {
  console.error('SUMMIT_SMTP_PASS is not set — add it to .env first.')
  process.exit(1)
}

try {
  summitTrailEmail.initializeTransporter()
  if (!(await summitTrailEmail.verified)) {
    console.error('Could not log in to the SMTP server — check SUMMIT_SMTP_HOST / PORT / USER / PASS.')
    process.exit(1)
  }
  const res = await summitTrailEmail.sendExpeditionUpdate(to, {
    adventureTitle: 'Test Expedition',
    advancedTo: 'Test Checkpoint',
    text: 'This is a test of Summit Trail follower notifications. If you can read this, email is working.',
    link: (process.env.NUXT_PUBLIC_APP_URL || 'https://summittrail.newvision.co.ug') + '/tracking',
  })
  console.log(`Sent. messageId: ${res.messageId}`)
  process.exit(0)
} catch (err) {
  console.error(err.message)
  process.exit(1)
}
