const ipRequests = new Map(); // ip -> Array of timestamps
const bannedIPs = new Map();  // ip -> ban expiry timestamp

const LIMIT = 5;
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const BAN_DURATION_MS = 5 * 60 * 1000; // 5 minutes ban duration

function getClientIp(req) {
    // Check forwarded headers (useful behind proxies like Vercel or HF)
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress || req.ip;
}

function checkRateLimit(req, res, next) {
    const ip = getClientIp(req);
    const now = Date.now();

    // Check if IP is currently banned
    if (bannedIPs.has(ip)) {
        const banExpiry = bannedIPs.get(ip);
        if (now < banExpiry) {
            const minutesLeft = Math.ceil((banExpiry - now) / 60000);
            return res.status(429).json({ 
                error: `Your IP has been temporarily banned due to suspicious activity (5 attempts in 5 minutes). Try again in ${minutesLeft} minute(s).` 
            });
        } else {
            bannedIPs.delete(ip); // Ban expired
        }
    }

    // Get request history for this IP
    let requests = ipRequests.get(ip) || [];
    // Filter out requests older than the 5-minute window
    requests = requests.filter(timestamp => now - timestamp < WINDOW_MS);

    if (requests.length >= LIMIT) {
        // Ban the IP for 5 minutes
        bannedIPs.set(ip, now + BAN_DURATION_MS);
        ipRequests.delete(ip); // Reset request history on ban
        return res.status(429).json({ 
            error: 'Your IP has been temporarily banned due to suspicious activity (5 attempts in 5 minutes). Try again in 5 minutes.' 
        });
    }

    // Record this request
    requests.push(now);
    ipRequests.set(ip, requests);
    next();
}

module.exports = { checkRateLimit };
