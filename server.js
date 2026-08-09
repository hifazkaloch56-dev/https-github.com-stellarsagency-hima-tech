/**
 * ============================================================
 *  HIMA TECH RCM - Backend API Server
 *  Node.js + Express
 * ============================================================
 *
 *  Run with:   node server.js
 *  Health:     GET  /api/health
 *  Contact:    POST /api/contact   -> { success: true }
 *  Audit:      POST /api/audit     -> { success: true }
 *  Blog:       GET  /api/blog      -> { posts: [...] }
 * ============================================================
 */

// Load environment variables from a .env file if present (e.g. PORT=5000)
require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();

// Server port - reads PORT from environment variables, falls back to 5000
const PORT = process.env.PORT || 5000;

/* ------------------------------------------------------------
   MIDDLEWARE
   ------------------------------------------------------------ */

// Parse incoming JSON request bodies
app.use(express.json());

// Enable CORS for all origins (adjust in production)
app.use(cors());

// Serve the static frontend (index.html) from this directory
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

/* ------------------------------------------------------------
   BLOG DATA
   Six sample posts shipped with the site (title, date, category,
   icon, thumb, excerpt).
   ------------------------------------------------------------ */

const posts = [
  {
    title: '5 Denial Management Strategies That Actually Work',
    date: 'January 12, 2026',
    category: 'Denial Management',
    icon: 'fa-ban',
    thumb: 'thumb-1',
    excerpt: 'Stop writing off denials. These five root-cause strategies recover revenue most practices leave behind.'
  },
  {
    title: 'CAQH Updates Every Provider Must Know in 2026',
    date: 'February 3, 2026',
    category: 'Credentialing',
    icon: 'fa-id-badge',
    thumb: 'thumb-2',
    excerpt: 'New attestation windows and data standards are coming. Stay ahead of credentialing deadlines.'
  },
  {
    title: 'ICD-10 Coding Pitfalls: Avoiding Compliance Risk',
    date: 'February 21, 2026',
    category: 'Medical Coding',
    icon: 'fa-book-medical',
    thumb: 'thumb-3',
    excerpt: 'Six common coding mistakes that trigger audits — and how certified coders avoid them.'
  },
  {
    title: 'How RCM Automation Boosts Collections by 30%',
    date: 'March 10, 2026',
    category: 'RCM Strategy',
    icon: 'fa-robot',
    thumb: 'thumb-4',
    excerpt: 'From claim scrubbing to AR follow-up, automation accelerates cash flow without losing accuracy.'
  },
  {
    title: 'Telehealth Billing Rules: A 2026 Refresher',
    date: 'April 2, 2026',
    category: 'Telehealth Billing',
    icon: 'fa-video',
    thumb: 'thumb-5',
    excerpt: 'Modifiers, place of service and payer quirks — the telehealth billing guide your team needs.'
  },
  {
    title: 'AR Follow-Up: Why Speed Matters for Reimbursement',
    date: 'April 24, 2026',
    category: 'Medical Billing Tips',
    icon: 'fa-clock',
    thumb: 'thumb-6',
    excerpt: 'Every day of aging costs you real money. Here is how disciplined follow-up timelines win.'
  }
];

/* ------------------------------------------------------------
   API ROUTES
   ------------------------------------------------------------ */

/**
 * GET /api/health
 * Simple health check to confirm the API is running.
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API is running'
  });
});

/**
 * POST /api/contact
 * Accepts JSON { name, email, phone, message } from the Contact
 * page form, logs the data, and returns success.
 */
app.post('/api/contact', (req, res) => {
  const { name, email, phone, message } = req.body || {};

  if (!name || !email || !phone || !message) {
    return res.status(400).json({
      success: false,
      error: 'All fields (name, email, phone, message) are required.'
    });
  }

  console.log('[contact] New message received:');
  console.log('  Name:    ' + name);
  console.log('  Email:   ' + email);
  console.log('  Phone:   ' + phone);
  console.log('  Message: ' + message);

  return res.status(200).json({ success: true });
});

/**
 * POST /api/audit
 * Accepts the full Free RCM Audit request payload, logs every
 * field, and returns success.
 */
app.post('/api/audit', (req, res) => {
  const body = req.body || {};

  // Basic validation of the required top-level sections
  if (!body.practice || !body.contact || !body.billing || !body.consent) {
    return res.status(400).json({
      success: false,
      error: 'Incomplete audit request. Practice, contact, billing and consent are required.'
    });
  }

  console.log('[audit] FREE RCM Audit request received:');
  console.log('  --- PRACTICE INFORMATION ---');
  console.log(JSON.stringify(body.practice, null, 2));
  console.log('  --- CONTACT INFORMATION ---');
  console.log(JSON.stringify(body.contact, null, 2));
  console.log('  --- CURRENT BILLING INFORMATION ---');
  console.log(JSON.stringify(body.billing, null, 2));
  console.log('  --- CHALLENGES ---');
  console.log(JSON.stringify(body.challenges || [], null, 2));
  console.log('  --- COMMENTS ---');
  console.log(body.comments || '(none)');
  console.log('  --- CONSENT ---');
  console.log('Consented: ' + Boolean(body.consent));

  return res.status(200).json({ success: true });
});

/**
 * GET /api/blog
 * Returns the mock array of 6 blog posts.
 */
app.get('/api/blog', (req, res) => {
  res.status(200).json({ posts });
});

/* ------------------------------------------------------------
   ERROR HANDLING
   ------------------------------------------------------------ */

// 404 handler for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Fallback: serve index.html for any other GET request (SPA/client routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Global error handler - catches any unexpected server errors
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[error] Unhandled error:', err.message);
  res.status(500).json({
    success: false,
    error: 'Internal server error. Please try again later.'
  });
});

/* ------------------------------------------------------------
   VERCEL / SERVERLESS SUPPORT
   Export the app so Vercel can run it as a Serverless Function.
   ------------------------------------------------------------ */

// Export for Vercel serverless deployments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = app;
}

// Only start the HTTP server when run directly (node server.js),
// not when imported as a Vercel serverless function.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('============================================');
    console.log(`  HIMA TECH RCM API running on port ${PORT}`);
    console.log(`  Open http://localhost:${PORT} in your browser`);
    console.log('============================================');
  });
}
