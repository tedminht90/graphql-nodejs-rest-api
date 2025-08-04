// Import model User để thực hiện các thao tác với database
const User = require('../models/User');

/**
 * RESOLVERS - Định nghĩa cách thức thực thi các truy vấn và mutation trong GraphQL schema
 * 
 * Resolver là các hàm JavaScript thực hiện logic nghiệp vụ cho từng field trong schema.
 * Mỗi resolver nhận vào các tham số được truyền từ GraphQL query/mutation và trả về dữ liệu tương ứng.
 * 
 * Cấu trúc: 
 * - Query resolvers: Xử lý các truy vấn đọc dữ liệu (GET)
 * - Mutation resolvers: Xử lý các thao tác thay đổi dữ liệu (POST, PUT, DELETE)
 */
const root = {
    // =================== QUERY RESOLVERS ===================
    // Các resolver này xử lý các truy vấn đọc dữ liệu
    
    /**
     * Hello Resolver - Truy vấn test đơn giản
     * Công dụng: Kiểm tra kết nối GraphQL có hoạt động không
     * Tham số: Không có
     * Trả về: Chuỗi "Hello World!"
     */
    hello: () => {
        console.log('Hello resolver được gọi - GraphQL đang hoạt động!');
        return 'Hello World!';
    },

    /**
     * User Resolver - Lấy thông tin một user theo ID
     * Công dụng: Truy xuất thông tin chi tiết của một user cụ thể
     * Tham số: { id } - ID của user cần tìm (GraphQL tự động truyền vào)
     * Trả về: User object hoặc null nếu không tìm thấy
     */
    user: async ({ id }) => {
        // Chuyển đổi id từ string sang số nguyên vì database lưu dưới dạng INTEGER
        // parseInt(id, 10) có nghĩa là chuyển đổi theo hệ cơ số 10 (decimal)
        return User.getUserById(parseInt(id, 10));
    },

    /**
     * Users Resolver - Lấy danh sách users với phân trang
     * Công dụng: Truy xuất danh sách users, hỗ trợ cursor-based pagination
     * Tham số: 
     *   - cursor: ID của user cuối cùng từ lần truy vấn trước (để pagination)
     *   - limit: Số lượng user tối đa trả về trong một lần
     * Trả về: Mảng các User objects
     */
    users: async ({ cursor, limit }) => {
        // Xử lý cursor: nếu có cursor thì chuyển sang số, không thì mặc định là 0
        const parsedCursor = cursor ? parseInt(cursor, 10) : 0;
        
        // Gọi method getUsers từ model, trả về object có cấu trúc { data: [...], hasMore: boolean }
        const result = await User.getUsers(parsedCursor, limit);
        
        // GraphQL chỉ cần mảng dữ liệu, không cần metadata khác
        return result.data;
    },

    /**
     * SearchUsers Resolver - Tìm kiếm users theo tiêu chí
     * Công dụng: Tìm kiếm users dựa trên email hoặc tên
     * Tham số:
     *   - email: Email cần tìm (tùy chọn)
     *   - name: Tên cần tìm (tùy chọn)
     * Trả về: Mảng các User objects phù hợp với tiêu chí tìm kiếm
     */
    searchUsers: async ({ email, name }) => {
        // Tạo object tiêu chí tìm kiếm, chỉ thêm field nào có giá trị
        const criteria = {};
        if (email) criteria.email = email;  // Chỉ thêm email nếu có truyền vào
        if (name) criteria.name = name;     // Chỉ thêm name nếu có truyền vào
        
        // Gọi method searchUsers từ model với criteria đã build
        return User.searchUsers(criteria);
    },

    // =================== MUTATION RESOLVERS ===================
    // Các resolver này xử lý các thao tác thay đổi dữ liệu

    /**
     * CreateUser Resolver - Tạo user mới
     * Công dụng: Thêm một user mới vào database
     * Tham số:
     *   - name: Tên của user (bắt buộc)
     *   - email: Email của user (bắt buộc)
     * Trả về: User object vừa được tạo (bao gồm ID mới được generate)
     */
    createUser: async ({ name, email }) => {
        // Gọi method createUser từ model với dữ liệu user mới
        return User.createUser({ name, email });
    },

    /**
     * UpdateUser Resolver - Cập nhật thông tin user
     * Công dụng: Thay đổi thông tin của user hiện có
     * Tham số:
     *   - id: ID của user cần cập nhật (bắt buộc)
     *   - name: Tên mới (tùy chọn)
     *   - email: Email mới (tùy chọn)
     * Trả về: User object sau khi được cập nhật
     */
    updateUser: async ({ id, name, email }) => {
        // Tạo object chứa dữ liệu cần cập nhật, chỉ thêm field nào có giá trị mới
        const updateData = {};
        if (name) updateData.name = name;     // Chỉ cập nhật name nếu có truyền vào
        if (email) updateData.email = email;  // Chỉ cập nhật email nếu có truyền vào
        
        // Chuyển đổi id sang số nguyên và gọi method updateUser từ model
        return User.updateUser(parseInt(id, 10), updateData);
    },

    /**
     * DeleteUser Resolver - Xóa user khỏi hệ thống
     * Công dụng: Xóa một user khỏi database
     * Tham số:
     *   - id: ID của user cần xóa (bắt buộc)
     * Trả về: User object vừa bị xóa (để client có thể xác nhận thông tin)
     */
    deleteUser: async ({ id }) => {
        // Chuyển đổi id sang số nguyên và gọi method deleteUser từ model
        return User.deleteUser(parseInt(id, 10));
    },
};

module.exports = root;