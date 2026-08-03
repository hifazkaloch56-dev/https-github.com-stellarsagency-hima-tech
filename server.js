/**
 * ============================================================
 *  MediBill Pro - Backend API Server
 *  Node.js + Express with an in-memory mock patient database.
 *  Open-source. All code, comments, and messages in English.
 * ============================================================
 *
 *  Run with:   node server.js
 *  Health:     GET  /api/health
 *  Lookup:     POST /api/patient/lookup
 *  Payment:    POST /api/payment/create-intent
 *  Webhook:    POST /api/webhooks/payment
 * ============================================================
 */

// Load environment variables from a .env file if present (e.g. PORT=5000)
require('dotenv').config();

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

/* ------------------------------------------------------------
   MOCK DATABASE
   In-memory patient records. Replace this array with a real
   database (e.g. MongoDB, PostgreSQL) in production.
   ------------------------------------------------------------ */

const patients = [
  {
    id: 1,
    accountNumber: 'ACC-4892',
    dob: '05/15',                 // MM/DD format
    name: 'Sarah Mitchell',
    balance: 245.75,
    insurance: 'BlueCross Shield'
  },
  {
    id: 2,
    accountNumber: 'ACC-7301',
    dob: '11/02',
    name: 'David Chen',
    balance: 120.5,
    insurance: 'Aetna'
  },
  {
    id: 3,
    accountNumber: 'ACC-1124',
    dob: '03/27',
    name: 'Maria Gonzalez',
    balance: 0,                   // Paid in full
    insurance: 'Medicare'
  },
  {
    id: 4,
    accountNumber: 'ACC-9055',
    dob: '09/18',
    name: 'James Wilson',
    balance: 610.3,
    insurance: 'Cigna'
  },
  {
    id: 5,
    accountNumber: 'ACC-3687',
    dob: '07/09',
    name: 'Aisha Patel',
    balance: 89.2,
    insurance: 'UnitedHealth'
  }
];

/* ------------------------------------------------------------
   HELPER FUNCTIONS
   ------------------------------------------------------------ */

/**
 * Normalizes a date of birth string to "MM/DD" format.
 * Accepts "5/15" or "05/15" and returns "05/15", or null if invalid.
 * @param {string} value - Raw DOB value from the request body.
 * @returns {string|null} Normalized "MM/DD" string or null.
 */
function normalizeDob(value) {
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})$/);
  if (!match) return null;
  const month = match[1].padStart(2, '0');
  const day = match[2].padStart(2, '0');
  return `${month}/${day}`;
}

/**
 * Finds a patient by account number and date of birth.
 * @param {string} accountNumber - The patient's account number.
 * @param {string} dob - Normalized DOB in "MM/DD" format.
 * @returns {object|undefined} Matching patient object or undefined.
 */
function findPatient(accountNumber, dob) {
  return patients.find(
    (p) =>
      p.accountNumber.toLowerCase() === accountNumber.toLowerCase() &&
      p.dob === dob
  );
}

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
 * POST /api/patient/lookup
 * Accepts JSON { accountNumber, dob } and looks up the patient
 * in the mock database.
 *
 * Success:  200 { success: true,  patient: { name, balance, insurance } }
 * Failure:  404 { success: false, error: "message" }  (not found)
 * Failure:  400 { success: false, error: "message" }  (invalid input)
 */
app.post('/api/patient/lookup', (req, res) => {
  const { accountNumber, dob } = req.body || {};

  // Validate required fields
  if (!accountNumber || !dob) {
    return res.status(400).json({
      success: false,
      error: 'Both "accountNumber" and "dob" are required.'
    });
  }

  // Normalize the DOB and reject malformed values
  const normalizedDob = normalizeDob(dob);
  if (!normalizedDob) {
    return res.status(400).json({
      success: false,
      error: 'Date of birth must be in MM/DD format (e.g. 05/15).'
    });
  }

  // Search the mock database
  const patient = findPatient(accountNumber, normalizedDob);

  if (!patient) {
    return res.status(404).json({
      success: false,
      error: 'No account found. Please check your account number and date of birth.'
    });
  }

  // Return only the safe patient fields (never expose the full record)
  return res.status(200).json({
    success: true,
    patient: {
      name: patient.name,
      balance: patient.balance,
      insurance: patient.insurance
    }
  });
});

/**
 * POST /api/payment/create-intent
 * Accepts JSON { accountNumber, amount } and returns a mock
 * clientSecret (in production this would be created by a
 * payment gateway such as Stripe, Braintree, or Adyen).
 *
 * Success:  200 { success: true,  clientSecret: "pi_mock_..." }
 * Failure:  404 { success: false, error: "message" } (unknown account)
 * Failure:  400 { success: false, error: "message" } (invalid amount)
 */
app.post('/api/payment/create-intent', (req, res) => {
  const { accountNumber, amount } = req.body || {};

  // Validate required fields
  if (!accountNumber || amount === undefined || amount === null) {
    return res.status(400).json({
      success: false,
      error: 'Both "accountNumber" and "amount" are required.'
    });
  }

  // Validate the amount is a positive finite number
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Amount must be a positive number.'
    });
  }

  // Ensure the account exists before creating a payment
  const patient = patients.find(
    (p) => p.accountNumber.toLowerCase() === accountNumber.toLowerCase()
  );

  if (!patient) {
    return res.status(404).json({
      success: false,
      error: 'Account not found. Cannot create a payment for an unknown account.'
    });
  }

  // Generate a mock payment intent identifier.
  // In production this would come from the payment gateway.
  const mockClientSecret = 'pi_mock_' + Math.floor(10000 + Math.random() * 89999);

  console.log(`[payment] Intent created for ${accountNumber}: ${mockClientSecret} (amount $${numericAmount.toFixed(2)})`);

  return res.status(200).json({
    success: true,
    clientSecret: mockClientSecret
  });
});

/**
 * POST /api/webhooks/payment
 * Stub webhook endpoint. In production this receives payment
 * confirmation events from the payment gateway. Here we simply
 * log the request body and acknowledge receipt.
 */
app.post('/api/webhooks/payment', (req, res) => {
  console.log('[webhook] Payment event received:', JSON.stringify(req.body, null, 2));
  return res.status(200).json({
    received: true
  });
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
   START THE SERVER
   ------------------------------------------------------------ */
app.listen(PORT, () => {
  console.log('============================================');
  console.log(`  MediBill Pro API running on port ${PORT}`);
  console.log(`  Open http://localhost:${PORT} in your browser`);
  console.log('============================================');
});
