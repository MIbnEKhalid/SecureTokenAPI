import express from "express";
import crypto from "crypto";

const app = express();
app.use(express.json()); // To parse JSON request bodies

// Configuration object with nested tokens by type
const config = {
    customKey: "45525",
    allowedDomains: ["localhost", "fff-mu-nine.vercel.app"],
    validTokens: [
        { token: process.env.Auth_TOKEN1 || "", status: "active" },
        { token: process.env.Auth_TOKEN2 || "", status: "active" },
        { token: process.env.Auth_TOKEN3 || "", status: "active" },
    ],
    platformTokens: {
        github: [
            {
                type: "read_repo",
                token: process.env.GITHUB_READ_REPO_TOKEN || "",
                status: "active",
            },
            {
                type: "full_access",
                token: process.env.GITHUB_FULL_ACCESS_TOKEN || "",
                status: "active",
            },
        ],
        netlify: [
            {
                type: "read_logs",
                token: process.env.NETLIFY_READ_LOGS_TOKEN || "",
                status: "active",
            },
            {
                type: "full_access",
                token: process.env.NETLIFY_FULL_ACCESS_TOKEN || "",
                status: "active", // Example of an inactive token
            },
        ],
        vercel: [
            {
                type: "deploy_access",
                token: process.env.VERCEL_DEPLOY_ACCESS_TOKEN || "",
                status: "active",
            },
            {
                type: "full_access",
                token: process.env.VERCEL_FULL_ACCESS_TOKEN || "",
                status: "active",
            },
        ],
    },
};

// Utility function for hashing tokens
const hashToken = (token) => {
    if (!token) {
        throw new Error("Token is undefined or empty.");
    }
    return crypto
        .createHmac("sha256", config.customKey)
        .update(token)
        .digest("hex");
};

// Hash all tokens in validTokens and platformTokens
config.validTokens.forEach((tokenObj) => {
    if (tokenObj.token) {
        tokenObj.token = hashToken(tokenObj.token);
    }
});

Object.keys(config.platformTokens).forEach((platform) => {
    config.platformTokens[platform].forEach((typeToken) => {
        if (typeToken.token) {
            typeToken.token = hashToken(typeToken.token);
        }
    });
});

// Middleware for domain validation
const validateDomain = (req, res, next) => {
    const requestDomain = req.get("Host");

    if (!requestDomain) {
        return res.status(400).json({ error: "Host header missing." });
    }

    const domain = requestDomain.split(":")[0];

    if (!config.allowedDomains.includes(domain)) {
        return res.status(403).json({ error: "Unauthorized domain." });
    }

    next();
};

// Caching mechanism
const cache = {}; // Simple in-memory cache

// Middleware for logging requests
app.use((req, res, next) => {
    const now = new Date();
    const formattedDate = now.toLocaleString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).replace(",", "");
    console.log(`[${formattedDate}] ${req.method} ${req.url}`);
    next();
});

// Route handler for fetching tokens based on platform and type
app.get("/api", validateDomain, (req, res, next) => {
    const { token: platformKey, type } = req.query;

    if (!platformKey || !type) {
        return res.status(400).json({ error: "Missing required parameters: 'token' or 'type'." });
    }

    const cacheKey = `${platformKey}-${type}`;

    // Check cache first
    if (cache[cacheKey]) {
        console.log(`Cache hit for: ${cacheKey}`);
        return res.json({ token: cache[cacheKey] });
    }

    const platform = config.platformTokens[platformKey.toLowerCase()];

    if (!platform) {
        return res.status(404).json({ error: `Platform '${platformKey}' not found.` });
    }

    const typeToken = platform.find((t) => t.type.toLowerCase() === type.toLowerCase());

    if (!typeToken) {
        return res.status(404).json({ error: `Type '${type}' not found for platform '${platformKey}'.` });
    }

    if (typeToken.status !== "active") {
        return res
            .status(403)
            .json({ error: `Type '${type}' is inactive. Please contact admin.` });
    }

    // Cache the response
    cache[cacheKey] = typeToken.token;

    console.log(`Cache miss for: ${cacheKey}`);
    res.json({ token: typeToken.token });
});

// Start the server
const port = 3800;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
