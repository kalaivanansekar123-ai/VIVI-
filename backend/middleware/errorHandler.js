// Global error handler middleware
function errorHandler(err, req, res, next) {
  console.error('API Error:', err);

  const statusCode = res.statusCode !== 200 ? res.statusCode : (err.status || 500);
  
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = errorHandler;
