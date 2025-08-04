const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { graphql } = require('graphql');
const { ruruHTML } = require('ruru/server');

// Import GraphQL
const graphqlSchema = require('./graphql/schema');
const graphqlResolvers = require('./graphql/resolvers');

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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// THÊM GRAPHQL ENDPOINT
// Xử lý yêu cầu GET để hiển thị giao diện GraphiQL
app.get('/graphql', (req, res) => {
  res.type('text/html');
  res.end(ruruHTML({ endpoint: '/graphql' }));
});

// Xử lý yêu cầu POST cho các truy vấn GraphQL thực tế
app.post('/graphql', async (req, res) => {
  try {
    const { query, variables, operationName } = req.body;
    
    const result = await graphql({
      schema: graphqlSchema,
      source: query,
      rootValue: graphqlResolvers,
      variableValues: variables,
      operationName: operationName,
    });
    
    res.json(result);
  } catch (error) {
    console.error('GraphQL Error:', error);
    res.status(500).json({ 
      errors: [{ message: 'Internal server error' }] 
    });
  }
});

// THÊM SWAGGER MIDDLEWARE
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

// Test POST endpoint
app.post('/test', (req, res) => {
  console.log('Test POST received:', req.body);
  res.json({ message: 'Test successful', body: req.body });
});

// Redirect root to GraphQL IDE
app.get('/', (req, res) => {
  res.redirect('/graphql');
});

// Serve API documentation in JSON format
app.get('/api-docs.json', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  } catch (error) {
    console.error('Error serving OpenAPI spec:', error);
    res.status(500).json({ error: 'Unable to serve API documentation' });
  }
});

// Routes
app.use('/api/users', userRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`🚀 GraphQL IDE: http://0.0.0.0:${PORT}/graphql`);
  console.log(`📍 API Documentation (REST): http://0.0.0.0:${PORT}/api-docs`);
});