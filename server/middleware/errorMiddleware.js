export function errorMiddleware(error, _req, res, _next) {
  console.error(error);
  if (error.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: error.message });
  }
  if (error.code === 11000) return res.status(409).json({ success: false, message: 'A record with that value already exists' });
  if (error.name === 'MulterError') return res.status(400).json({ success: false, message: error.message });
  const status = Number(error.status) || 500;
  res.status(status).json({ success: false, message: status === 500 ? 'An unexpected server error occurred' : error.message });
}
