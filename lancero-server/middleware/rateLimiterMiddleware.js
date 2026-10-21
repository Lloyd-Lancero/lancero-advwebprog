const rateLimit = require('express-rate-limit');
const { HttpStatus } = require('../config/constants');

const TOO_MANY = 429;

// Every limiter answers with the project's standard error structure
const buildLimiter = ({ windowMs, limit, message, skipSuccessfulRequests = false }) =>
    rateLimit({
        windowMs,
        limit,
        standardHeaders: true,   
        legacyHeaders: false,    
        skipSuccessfulRequests,
        message: { success: false, message, count: 0, data: null }
    });

// ---------------------------------------------------------------
// Which functions need a limiter, and why  (Part 7 + Part 9)
//
//  apiLimiter       every /api route   -> stops flooding / scraping of the whole API
//  loginLimiter     POST login         -> brute-force password guessing
//  registerLimiter  POST register      -> mass fake-account creation
//  passwordLimiter  PUT me/password    -> guessing the "current password"
//  reviewLimiter    POST review        -> review spam
//  orderLimiter     POST order         -> repeated checkout abuse
// ---------------------------------------------------------------
const apiLimiter = buildLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    message: 'Too many requests. Please try again later.'
});

// Only FAILED logins count towards this limit (successful ones are skipped)
const loginLimiter = buildLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    skipSuccessfulRequests: true,
    message: 'Too many login attempts. Please try again after 15 minutes.'
});

const registerLimiter = buildLimiter({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    message: 'Too many accounts created from this device. Please try again after 1 hour.'
});

const passwordLimiter = buildLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: 'Too many password change attempts. Please try again after 15 minutes.'
});

const reviewLimiter = buildLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    message: 'Too many reviews submitted. Please try again later.'
});

const orderLimiter = buildLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    message: 'Too many checkout attempts. Please try again later.'
});

// ================================================================
// PART 9 - Progressive login lockout
//
// Failed logins in a row   -> wait before the next try
//   5 or more              ->  3 minutes
//   8 or more              ->  5 minutes
//   10 or more             -> 30 minutes
// A successful login clears the counter. Attempts made while locked
// are rejected with 429 and do NOT make the lock longer.
//
// Attempts are tracked per IP + e-mail, so one person typing the wrong
// password cannot lock the real owner out from another device.
// The data is kept in memory (resets when the server restarts); for several
// servers you would move it to Redis or MongoDB.
// ================================================================
const LOCK_TIERS = [               // checked from the highest tier down
    { failures: 10, minutes: 30 },
    { failures: 8, minutes: 5 },
    { failures: 5, minutes: 3 }
];
const FORGET_AFTER_MS = 24 * 60 * 60 * 1000;   // an old record is forgotten after 24h

const loginAttempts = new Map();   // key -> { failures, lockedUntil, lastFailure }

const lockMinutesFor = (failures) => {
    const tier = LOCK_TIERS.find((t) => failures >= t.failures);
    return tier ? tier.minutes : 0;
};

const formatWait = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    if (minutes === 0) return `${rest} second(s)`;
    return rest === 0 ? `${minutes} minute(s)` : `${minutes} minute(s) ${rest} second(s)`;
};

const loginThrottle = (req, res, next) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const key = `${req.ip}|${email}`;
    const now = Date.now();
    const record = loginAttempts.get(key);

    // 1) Still locked? Stop here, the controller never runs.
    if (record && record.lockedUntil > now) {
        const seconds = Math.ceil((record.lockedUntil - now) / 1000);
        res.set('Retry-After', String(seconds));

        return res.status(TOO_MANY).json({
            success: false,
            message: `Too many failed login attempts. Try again in ${formatWait(seconds)}.`,
            count: 0,
            data: null,
            retryAfterSeconds: seconds,
            failedAttempts: record.failures
        });
    }

    // 2) Let the request through, then look at how it ended.
    res.on('finish', () => {
        if (res.statusCode === HttpStatus.OK) {
            loginAttempts.delete(key);              // success -> start fresh
            return;
        }

        if (res.statusCode === HttpStatus.UNAUTHORIZED) {   // wrong email or password
            const current = loginAttempts.get(key) || { failures: 0, lockedUntil: 0, lastFailure: 0 };
            current.failures += 1;
            current.lastFailure = Date.now();

            const minutes = lockMinutesFor(current.failures);
            current.lockedUntil = minutes > 0 ? Date.now() + minutes * 60 * 1000 : 0;

            loginAttempts.set(key, current);
        }
    });

    next();
};

// Housekeeping so the Map cannot grow forever
const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of loginAttempts) {
        if (record.lockedUntil < now && now - record.lastFailure > FORGET_AFTER_MS) {
            loginAttempts.delete(key);
        }
    }
}, 60 * 60 * 1000);
cleanup.unref();   // don't keep Node alive just for this timer

// Only used by tests / admin tools
const resetLoginAttempts = () => loginAttempts.clear();

module.exports = {
    apiLimiter,
    loginLimiter,
    registerLimiter,
    passwordLimiter,
    reviewLimiter,
    orderLimiter,
    loginThrottle,
    resetLoginAttempts,
    lockMinutesFor
};
