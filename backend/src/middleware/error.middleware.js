export const errorHandler = (err, req, res, next) => {
  console.log('\n==================================');
  console.log('❌ Error:', err.message);
  console.log('Stack:', err.stack);
  console.log('==================================\n');

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: err.errors,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      message: 'Unauthorized',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  return res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};