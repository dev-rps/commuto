const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : [];

function checkOrigin(origin, callback) {
  // Allow requests with no origin (like mobile apps, curl, postman, and local test scripts)
  if (!origin) {
    return callback(null, true);
  }

  // Check if origin matches any of:
  // 1. Explicitly configured origins in CORS_ORIGIN env var
  // 2. Localhost/loopback (for local development)
  // 3. Vercel deployments (ends with .vercel.app)
  const isAllowed =
    allowedOrigins.includes(origin) ||
    origin === "http://localhost:5173" ||
    origin === "http://localhost:3000" ||
    origin.startsWith("http://localhost:") ||
    origin.startsWith("http://127.0.0.1:") ||
    origin.endsWith(".vercel.app") ||
    /\.vercel\.app$/.test(origin);

  if (isAllowed) {
    callback(null, true);
  } else {
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  }
}

const corsOptions = {
  origin: checkOrigin,
  credentials: true,
};

module.exports = corsOptions;
