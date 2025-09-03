function errorHandler(err, req, res, next) {
  console.error("🔥 Error:", err.message);
  res.status(err.status || 500).json({
    ok: false,
    error: err.message || "Internal Server Error",
  });
}

module.exports = errorHandler;
