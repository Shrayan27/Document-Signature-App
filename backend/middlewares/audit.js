export default (req, res, next) => {
 console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} by ${req.user?._id || 'unauthenticated'}`);
  next();
};

