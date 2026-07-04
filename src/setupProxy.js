const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://resume-mailer-438v.onrender.com',
      changeOrigin: true,
    })
  );
};