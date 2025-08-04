const pool = require('../config/db');

// Chuyển sang Cursor-based Pagination
const getUsers = async (cursor = 0, limit = 20) => {
    // Truy vấn các bản ghi có ID lớn hơn cursor
    const query = `
        SELECT 
            id, name, email, 
            created_at AT TIME ZONE 'Asia/Ho_Chi_Minh' as created_at, 
            updated_at AT TIME ZONE 'Asia/Ho_Chi_Minh' as updated_at
        FROM test_nodejs.users 
        WHERE id > $1 
        ORDER BY id ASC 
        LIMIT $2
    `;
    
    const result = await pool.query(query, [cursor, limit]);
    const data = result.rows;

    // Xác định con trỏ cho trang tiếp theo
    const nextCursor = data.length === limit ? data[data.length - 1].id : null;

    return {
        data,
        nextCursor
    };
};

const getUserById = async (id) => {
    console.log('getUserById called with id:', id);
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM test_nodejs.users WHERE id = $1', [id]);
        console.log('Query result:', result.rows[0]);
        return result.rows[0];
    } finally {
        client.release();
    }
};

const createUser = async (user) => {
    const { name, email } = user;
    const result = await pool.query(
        'INSERT INTO test_nodejs.users (name, email) VALUES ($1, $2) RETURNING *',
        [name, email]
    );
    return result.rows[0];
};

const updateUser = async (id, user) => {
    const { name, email } = user;
    const result = await pool.query(
        'UPDATE test_nodejs.users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
        [name, email, id]
    );
    return result.rows[0];
};

const deleteUser = async (id) => {
    const result = await pool.query('DELETE FROM test_nodejs.users WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
};

const searchUsers = async (criteria) => {
    let query = `
        SELECT 
            id, name, email, 
            created_at AT TIME ZONE 'Asia/Ho_Chi_Minh' as created_at, 
            updated_at AT TIME ZONE 'Asia/Ho_Chi_Minh' as updated_at
        FROM test_nodejs.users 
    `;
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (criteria.email) {
        conditions.push(`email = $${paramIndex++}`);
        values.push(criteria.email);
    }

    if (criteria.name) {
        conditions.push(`name ILIKE $${paramIndex++}`);
        values.push(`%${criteria.name}%`);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY id ASC';

    const result = await pool.query(query, values);
    return result.rows;
};

// Thêm hàm queryUsers
const queryUsers = async (params) => {
    const { where, select, sort, limit, offset } = params;

    // 1. Xử lý phần SELECT
    let selectClause = '*';
    if (select && select.length > 0) {
        // Lọc để chỉ cho phép các cột hợp lệ, tránh SQL Injection
        const allowedColumns = ['id', 'name', 'email', 'created_at', 'updated_at'];
        const filteredSelect = select.filter(field => allowedColumns.includes(field));
        if (filteredSelect.length > 0) {
            selectClause = filteredSelect.join(', ');
        }
    }

    let query = `SELECT ${selectClause} FROM test_nodejs.users`;
    const values = [];
    const conditions = [];
    let paramIndex = 1;

    // 2. Xử lý phần WHERE
    if (where) {
        Object.keys(where).forEach(field => {
            const operator = Object.keys(where[field])[0];
            const value = where[field][operator];
            
            const operatorMap = {
                equals: '=',
                contains: 'ILIKE',
                gt: '>',
                lt: '<'
            };

            if (operatorMap[operator]) {
                conditions.push(`${field} ${operatorMap[operator]} $${paramIndex++}`);
                values.push(operator === 'contains' ? `%${value}%` : value);
            }
        });
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    // 3. Xử lý phần SORT
    if (sort && sort.field) {
        const direction = sort.direction && sort.direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        query += ` ORDER BY ${sort.field} ${direction}`;
    } else {
        query += ' ORDER BY id ASC'; // Mặc định sắp xếp theo ID
    }

    // 4. Xử lý phần LIMIT và OFFSET (phân trang)
    if (limit) {
        query += ` LIMIT $${paramIndex++}`;
        values.push(limit);
    }
    if (offset) {
        query += ` OFFSET $${paramIndex++}`;
        values.push(offset);
    }

    const result = await pool.query(query, values);
    return result.rows;
};


module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    searchUsers,
    queryUsers, // Đã thêm
};