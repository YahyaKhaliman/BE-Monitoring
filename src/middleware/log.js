const SENSITIVE_KEYS = new Set([
    "password",
    "old_password",
    "new_password",
    "token",
    "authorization",
    "access_token",
    "refresh_token",
]);

function maskSensitive(value) {
    if (Array.isArray(value)) {
        return value.map(maskSensitive);
    }

    if (value && typeof value === "object") {
        return Object.entries(value).reduce((acc, [key, val]) => {
            if (SENSITIVE_KEYS.has(String(key).toLowerCase())) {
                acc[key] = "***";
            } else {
                acc[key] = maskSensitive(val);
            }
            return acc;
        }, {});
    }

    return value;
}

function log(req, res, next) {
    const start = Date.now();
    const logBodyEnabled = (process.env.LOG_BODY || "true").toLowerCase() === "true";
    const maskedHeaders = maskSensitive(req.headers || {});

    console.log("\n==================== REQUEST ====================");
    console.log(`${req.method} ${req.originalUrl}`);
    console.log("Headers:", {
        origin: maskedHeaders.origin,
        authorization: maskedHeaders.authorization,
        "content-type": maskedHeaders["content-type"],
    });

    if (Object.keys(req.params).length) {
        console.log("Params :", req.params);
    }

    if (Object.keys(req.query).length) {
        console.log("Query  :", req.query);
    }

    if (logBodyEnabled && req.body && Object.keys(req.body).length) {
        console.log("Body   :", maskSensitive(req.body));
    }

    const originalSend = res.send;

    res.send = function (body) {
        const duration = Date.now() - start;

        console.log("==================== RESPONSE ====================");
        console.log("Status :", res.statusCode);
        console.log("Time   :", `${duration} ms`);
        // console.log("Body   :", body);
        console.log("=================================================\n");

        return originalSend.call(this, body);
    };

    next();
}

module.exports = { log };
