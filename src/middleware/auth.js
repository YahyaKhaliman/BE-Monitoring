const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    const token = authHeader.slice(7);

    if (!process.env.JWT_SECRET) {
        return res
            .status(500)
            .json({ ok: false, message: "JWT_SECRET belum diset di environment" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        return res.status(401).json({ ok: false, message: "Token tidak valid/expired" });
    }
}

module.exports = { authenticateToken };
