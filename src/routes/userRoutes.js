const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

// Import middleware (nếu cần)
// const authMiddleware = require('../middleware/authMiddleware');
// const validationMiddleware = require('../middleware/validationMiddleware');

// Routes cho User CRUD operations

// GET /api/users - Lấy tất cả users
router.get('/', UserController.getAllUsers);

// POST /api/users/search - Tìm user theo criteria
router.post('/search', UserController.searchUsers);

// POST /api/users/query
router.post('/query', UserController.queryUsers);

// GET /api/users/:id - Lấy user theo ID
router.get('/uid/:id', UserController.getUserById);

// POST /api/users - Tạo user mới
router.post('/', UserController.createUser);

// PUT /api/users/:id - Cập nhật user
router.put('/uid/:id', UserController.updateUser);

// DELETE /api/users/:id - Xóa user
router.delete('/uid/:id', UserController.deleteUser);

// Có thể thêm middleware cho từng route cụ thể:
// router.get('/', authMiddleware, UserController.getAllUsers);
// router.post('/', validationMiddleware.validateUser, UserController.createUser);

module.exports = router;