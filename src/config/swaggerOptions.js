const swaggerOptions = {
  explorer: true,
  customCss: `
    .swagger-ui .topbar { 
      display: none; 
    }
    .swagger-ui .info .title {
      color: #3b82f6;
    }
    .swagger-ui .scheme-container {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
    }
  `,
  customSiteTitle: 'Node.js REST API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestDuration: true,
    tryItOutEnabled: true,
    requestInterceptor: (req) => {
      req.headers['Content-Type'] = 'application/json';
      return req;
    },
  },
};

module.exports = swaggerOptions;