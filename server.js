/**
 * HIMA TECH RCM - Backend API Server
 * Node.js + Express + Nodemailer
 */

require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

const PORT = process.env.PORT || 5000;

/* ------------------------------------------------------------
   MIDDLEWARE
------------------------------------------------------------ */

app.use(express.json());
app.use(cors());

app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

/* ------------------------------------------------------------
   EMAIL CONFIGURATION
------------------------------------------------------------ */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const COMPANY_EMAIL = process.env.COMPANY_EMAIL || 'info@himatechrcm.com';

/* ------------------------------------------------------------
   BLOG DATA
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
   HEALTH
------------------------------------------------------------ */

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API is running'
  });
});

/* ------------------------------------------------------------
   CONTACT FORM
------------------------------------------------------------ */

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body || {};

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        error: 'All fields (name, email, phone, message) are required.'
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address.'
      });
    }

    await transporter.sendMail({
      from: `"Hima Tech RCM Website" <${process.env.SMTP_USER}>`,
      to: COMPANY_EMAIL,
      replyTo: email,
      subject: `New Contact Form Message - ${name}`,
      text:
`NEW CONTACT FORM MESSAGE

Name: ${name}
Email: ${email}
Phone: ${phone}

Message:
${message}
`,
      html: `
        <h2>New Contact Form Message</h2>

        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>

        <h3>Message</h3>
        <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      `
    });

    console.log('[contact] Email sent successfully to ' + COMPANY_EMAIL);

    return res.status(200).json({
      success: true
    });

  } catch (error) {
    console.error('[contact] Email error:', error);

    return res.status(500).json({
      success: false,
      error: 'Message could not be sent. Please try again later.'
    });
  }
});

/* ------------------------------------------------------------
   FREE RCM AUDIT FORM
------------------------------------------------------------ */

app.post('/api/audit', async (req, res) => {
  try {
    const body = req.body || {};

    if (!body.practice || !body.contact || !body.billing || !body.consent) {
      return res.status(400).json({
        success: false,
        error: 'Incomplete audit request. Practice, contact, billing and consent are required.'
      });
    }

    const practice = body.practice;
    const contact = body.contact;
    const billing = body.billing;
    const challenges = body.challenges || [];
    const comments = body.comments || '';

    if (!contact.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address.'
      });
    }

    await transporter.sendMail({
      from: `"Hima Tech RCM Website" <${process.env.SMTP_USER}>`,
      to: COMPANY_EMAIL,
      replyTo: contact.email,
      subject: `FREE RCM Audit Request - ${practice.practiceName || 'New Practice'}`,

      text:
`NEW FREE RCM AUDIT REQUEST

PRACTICE INFORMATION
Practice Name: ${practice.practiceName || ''}
Provider Name: ${practice.providerName || ''}
Specialty: ${practice.specialty || ''}
Number of Providers: ${practice.numProviders || ''}
City/State: ${practice.cityState || ''}
Website: ${practice.website || ''}

CONTACT INFORMATION
Full Name: ${contact.fullName || ''}
Job Title: ${contact.jobTitle || ''}
Email: ${contact.email || ''}
Phone: ${contact.phone || ''}

CURRENT BILLING INFORMATION
Billing Method: ${billing.billingMethod || ''}
Current Company: ${billing.currentCompany || ''}
EMR Software: ${billing.emrSoftware || ''}
Monthly Volume: ${billing.monthlyVolume || ''}

CHALLENGES
${challenges.length ? challenges.join(', ') : 'None selected'}

COMMENTS
${comments || 'None'}

Consent: ${Boolean(body.consent)}
`,

      html: `
        <h2>FREE RCM Audit Request</h2>

        <h3>Practice Information</h3>
        <p><strong>Practice Name:</strong> ${escapeHtml(practice.practiceName || '')}</p>
        <p><strong>Provider Name:</strong> ${escapeHtml(practice.providerName || '')}</p>
        <p><strong>Specialty:</strong> ${escapeHtml(practice.specialty || '')}</p>
        <p><strong>Number of Providers:</strong> ${escapeHtml(String(practice.numProviders || ''))}</p>
        <p><strong>City/State:</strong> ${escapeHtml(practice.cityState || '')}</p>
        <p><strong>Website:</strong> ${escapeHtml(practice.website || '')}</p>

        <h3>Contact Information</h3>
        <p><strong>Full Name:</strong> ${escapeHtml(contact.fullName || '')}</p>
        <p><strong>Job Title:</strong> ${escapeHtml(contact.jobTitle || '')}</p>
        <p><strong>Email:</strong> ${escapeHtml(contact.email || '')}</p>
        <p><strong>Phone:</strong> ${escapeHtml(contact.phone || '')}</p>

        <h3>Current Billing Information</h3>
        <p><strong>Billing Method:</strong> ${escapeHtml(billing.billingMethod || '')}</p>
        <p><strong>Current Company:</strong> ${escapeHtml(billing.currentCompany || '')}</p>
        <p><strong>EMR Software:</strong> ${escapeHtml(billing.emrSoftware || '')}</p>
        <p><strong>Monthly Volume:</strong> ${escapeHtml(billing.monthlyVolume || '')}</p>

        <h3>Challenges</h3>
        <p>${escapeHtml(challenges.length ? challenges.join(', ') : 'None selected')}</p>

        <h3>Comments</h3>
        <p>${escapeHtml(comments || 'None').replace(/\n/g, '<br>')}</p>

        <p><strong>Consent:</strong> Yes</p>
      `
    });

    console.log('[audit] Audit email sent successfully to ' + COMPANY_EMAIL);

    return res.status(200).json({
      success: true
    });

  } catch (error) {
    console.error('[audit] Email error:', error);

    return res.status(500).json({
      success: false,
      error: 'Audit request could not be sent. Please try again later.'
    });
  }
});

/* ------------------------------------------------------------
   BLOG
------------------------------------------------------------ */

app.get('/api/blog', (req, res) => {
  res.status(200).json({ posts });
});

/* ------------------------------------------------------------
   ROBOTS
------------------------------------------------------------ */

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(
    'User-agent: *\n' +
    'Allow: /\n\n' +
    'Sitemap: https://himatechrcm.com/sitemap.xml\n'
  );
});

/* ------------------------------------------------------------
   SITEMAP
------------------------------------------------------------ */

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');

  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://himatechrcm.com/</loc>
  </url>
  <url>
    <loc>https://himatechrcm.com/about</loc>
  </url>
  <url>
    <loc>https://himatechrcm.com/billing</loc>
  </url>
  <url>
    <loc>https://himatechrcm.com/credentialing</loc>
  </url>
  <url>
    <loc>https://himatechrcm.com/coding</loc>
  </url>
  <url>
    <loc>https://himatechrcm.com/process</loc>
  </url>
  <url>
    <loc>https://himatechrcm.com/audit</loc>
  </url>
  <url>
    <loc>https://www.himatechrcm.com/blog.html</loc>
  </url>
    <url>
    <loc>https://www.himatechrcm.com/blog/denial-management-strategies.html</loc>
  </url>
  <url>
    <loc>https://himatechrcm.com/contact</loc>
  </url>
  <url>
    <loc>https://himatechrcm.com/privacy</loc>
  </url>
  <url>
    <loc>https://himatechrcm.com/terms</loc>
  </url>
  <url>
    <loc>https://himatechrcm.com/hipaa</loc>
  </url>
</urlset>`);
});

/* ------------------------------------------------------------
   API 404
------------------------------------------------------------ */

app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

/* ------------------------------------------------------------
   SPA FALLBACK
------------------------------------------------------------ */

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

/* ------------------------------------------------------------
   ERROR HANDLER
------------------------------------------------------------ */

app.use((err, req, res, next) => {
  console.error('[error] Unhandled error:', err.message);

  res.status(500).json({
    success: false,
    error: 'Internal server error. Please try again later.'
  });
});

/* ------------------------------------------------------------
   HTML ESCAPE HELPER
------------------------------------------------------------ */

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ------------------------------------------------------------
   VERCEL / LOCAL SERVER
------------------------------------------------------------ */

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log('============================================');
    console.log(`  HIMA TECH RCM API running on port ${PORT}`);
    console.log(`  Open http://localhost:${PORT} in your browser`);
    console.log('============================================');
  });
}
