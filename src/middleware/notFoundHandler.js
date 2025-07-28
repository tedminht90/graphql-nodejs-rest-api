// 404 Not Found middleware
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot find the endpoint: ${req.method} ${req.path}`,
    availableEndpoints: {
      users: {
        'GET /api/users': 'Get all users',
        'GET /api/users/uid/:id': 'Get user by ID',
        'POST /api/users/search': 'Search users',
        'POST /api/users/query': 'Query users',
        'POST /api/users': 'Create new user',
        'PUT /api/users/uid/:id': 'Update user',
        'DELETE /api/users/uid/:id': 'Delete user'
      },
      health: {
        'GET /health': 'Health check'
      }
    }
  });
};

module.exports = notFoundHandler;