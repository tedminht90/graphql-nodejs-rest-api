// Import hàm buildSchema từ thư viện GraphQL để tạo schema
const { buildSchema } = require('graphql');

/**
 * SCHEMA GRAPHQL - Định nghĩa cấu trúc dữ liệu và các hoạt động có thể thực hiện
 * 
 * GraphQL Schema Definition Language (SDL) được sử dụng để:
 * - Định nghĩa các kiểu dữ liệu (types)
 * - Định nghĩa các truy vấn có thể thực hiện (queries)
 * - Định nghĩa các thao tác thay đổi dữ liệu (mutations)
 */
const schema = buildSchema(`
    """
    Kiểu dữ liệu User - Đại diện cho một người dùng trong hệ thống
    - ID là duy nhất và bắt buộc (!)
    - name và email là bắt buộc 
    - created_at và updated_at là tùy chọn
    """
    type User {
        id: ID!              # ID duy nhất của user (bắt buộc)
        name: String!        # Tên của user (bắt buộc)
        email: String!       # Email của user (bắt buộc)
        created_at: String   # Thời gian tạo user (tùy chọn)
        updated_at: String   # Thời gian cập nhật user (tùy chọn)
    }

    """
    QUERY - Định nghĩa các truy vấn đọc dữ liệu (READ operations)
    Các query này không thay đổi dữ liệu, chỉ lấy thông tin
    """
    type Query {
        """Truy vấn đơn giản để test kết nối GraphQL"""
        hello: String
        
        """
        Lấy thông tin một user cụ thể bằng ID
        - Tham số: id (bắt buộc) - ID của user cần tìm
        - Trả về: User object hoặc null nếu không tìm thấy
        """
        user(id: ID!): User

        """
        Lấy danh sách tất cả users với hỗ trợ phân trang
        - cursor: ID của user cuối cùng từ lần query trước (để pagination)
        - limit: Số lượng user tối đa trả về trong một lần
        - Trả về: Mảng các User objects
        """
        users(cursor: ID, limit: Int): [User]

        """
        Tìm kiếm users theo tiêu chí
        - email: Tìm theo email (tùy chọn)
        - name: Tìm theo tên (tùy chọn)
        - Trả về: Mảng các User objects phù hợp với tiêu chí
        """
        searchUsers(email: String, name: String): [User]
    }

    """
    MUTATION - Định nghĩa các thao tác thay đổi dữ liệu (CREATE, UPDATE, DELETE)
    Các mutation này sẽ thay đổi dữ liệu trong database
    """
    type Mutation {
        """
        Tạo user mới
        - name: Tên của user (bắt buộc)
        - email: Email của user (bắt buộc)
        - Trả về: User object vừa được tạo
        """
        createUser(name: String!, email: String!): User

        """
        Cập nhật thông tin user hiện có
        - id: ID của user cần cập nhật (bắt buộc)
        - name: Tên mới (tùy chọn)
        - email: Email mới (tùy chọn)
        - Trả về: User object sau khi được cập nhật
        """
        updateUser(id: ID!, name: String, email: String): User

        """
        Xóa user khỏi hệ thống
        - id: ID của user cần xóa (bắt buộc)
        - Trả về: User object vừa bị xóa (để xác nhận)
        """
        deleteUser(id: ID!): User
    }
`);

module.exports = schema;
