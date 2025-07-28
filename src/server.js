const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import swagger
const { specs, swaggerUi } = require('./config/swagger');


// Import routes
const userRoutes = require('./routes/userRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFoundHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Global middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// THÊM SWAGGER MIDDLEWARE - QUAN TRỌNG
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Node.js REST API Documentation',
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Redirect root to API docs - THÊM DÒng NÀY
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Routes
app.use('/api/users', userRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`📍 API endpoints: http://localhost:${PORT}/api/users`);
});