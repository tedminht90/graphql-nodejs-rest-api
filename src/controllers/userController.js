const User = require('../models/User');

// Chuyển sang Cursor-based Pagination
const getAllUsers = async (req, res) => {
    try {
        // Lấy cursor và limit từ query string
        const cursor = parseInt(req.query.cursor) || 0; // Mặc định là 0 để lấy từ đầu
        const limit = parseInt(req.query.limit) || 20;

        const result = await User.getUsers(cursor, limit);

        // Xây dựng URL cho trang tiếp theo
        let nextUrl = null;
        if (result.nextCursor) {
            const url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
            const searchParams = new URLSearchParams(url.search);
            searchParams.set('cursor', result.nextCursor);
            searchParams.set('limit', limit);
            nextUrl = `${url.pathname}?${searchParams.toString()}`;
        }

        res.json({
            success: true,
            message: 'Get all users successfully',
            data: result.data,
            pagination: {
                nextCursor: result.nextCursor,
                nextUrl: nextUrl,
                limit: limit
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.getUserById(req.params.id);
        if (user) {
            res.json({ success: true, data: user });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const createUser = async (req, res) => {
    try {
        const newUser = await User.createUser(req.body);
        res.status(201).json({ success: true, data: newUser });
    } catch (err) {
        // Bắt lỗi email trùng lặp
        if (err.code === '23505') { // 23505 là mã lỗi unique_violation của PostgreSQL
            return res.status(409).json({ success: false, message: 'Email already exists.' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const updatedUser = await User.updateUser(req.params.id, req.body);
        if (updatedUser) {
            res.json({ success: true, data: updatedUser });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ success: false, message: 'Email already exists.' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        // Kiểm tra user có tồn tại không trước khi xóa
        const userToDelete = await User.getUserById(req.params.id);
        if (!userToDelete) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        await User.deleteUser(req.params.id);
        res.status(200).json({ success: true, message: 'User deleted successfully', data: userToDelete });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Triển khai hàm searchUsers
const searchUsers = async (req, res) => {
    try {
        const criteria = req.body;

        // Kiểm tra nếu không có tiêu chí nào được cung cấp
        if (Object.keys(criteria).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Search criteria cannot be empty. Please provide at least one field (e.g., email, name).'
            });
        }

        const users = await User.searchUsers(criteria);

        if (users.length > 0) {
            res.json({
                success: true,
                message: `Found ${users.length} user(s) matching the criteria.`,
                data: users,
                total: users.length
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No users found matching the criteria.',
                data: []
            });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Triển khai hàm queryUsers hiện tại đã không dùng nữa chuyển sang sử dụng GraphQL
const queryUsers = async (req, res) => {
    try {
        const params = req.body;
        const users = await User.queryUsers(params);

        res.json({
            success: true,
            message: `Query executed successfully. Found ${users.length} user(s).`,
            data: users,
            total: users.length
        });

    } catch (err) {
        // Bắt lỗi cột không hợp lệ từ PostgreSQL
        if (err.code === '42703') { // 42703 là mã lỗi undefined_column
            return res.status(400).json({ 
                success: false, 
                message: `Invalid field in 'select' or 'sort' parameter. ${err.message}` 
            });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};


module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    searchUsers, // Đã triển khai
    queryUsers,
};