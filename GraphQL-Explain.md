# Hướng dẫn GraphQL chi tiết - Cơ chế hoạt động và khác biệt với REST

## 📖 Mục lục

1. [GraphQL là gì?](#graphql-là-gì)
2. [Khác biệt cơ bản giữa GraphQL và REST](#khác-biệt-cơ-bản-giữa-graphql-và-rest)
3. [Cấu trúc GraphQL trong project](#cấu-trúc-graphql-trong-project)
4. [Kiến trúc API song song: GraphQL và REST](#kiến-trúc-api-song-song-graphql-và-rest)
5. [Cách hoạt động của GraphQL](#cách-hoạt-động-của-graphql)
6. [Schema - Bản thiết kế API](#schema---bản-thiết-kế-api)
7. [Resolvers - Logic xử lý](#resolvers---logic-xử-lý)
8. [Phân quyền và Bảo mật trong GraphQL](#phân-quyền-và-bảo-mật-trong-graphql)
9. [Ví dụ thực tế](#ví-dụ-thực-tế)
10. [Ưu nhược điểm](#ưu-nhược-điểm)
11. [Khi nào nên dùng GraphQL](#khi-nào-nên-dùng-graphql)

---

## GraphQL là gì?

**GraphQL** (Graph Query Language) là một ngôn ngữ truy vấn cho API, được Facebook phát triển vào năm 2012 và mở mã nguồn vào 2015.

### 🎯 **Đặc điểm chính:**

- **Một endpoint duy nhất**: Thay vì nhiều URL như REST
- **Client tự quyết định dữ liệu**: Yêu cầu chính xác những gì cần
- **Strongly typed**: Schema rõ ràng, kiểu dữ liệu chặt chẽ
- **Self-documenting**: Tự động tạo documentation

---

## Khác biệt cơ bản giữa GraphQL và REST

### 🔄 **REST API (Cách truyền thống)**

```bash
# Lấy thông tin user
GET /api/users/1
# Response: { id: 1, name: "John", email: "john@example.com", address: "...", phone: "..." }

# Lấy danh sách users
GET /api/users
# Response: [{ id: 1, name: "John", ... }, { id: 2, name: "Jane", ... }]

# Tạo user mới
POST /api/users
# Body: { name: "New User", email: "new@example.com" }
```

**❌ Vấn đề của REST:**

- **Over-fetching**: Nhận dữ liệu không cần thiết
- **Under-fetching**: Phải gọi nhiều API để có đủ dữ liệu
- **Multiple requests**: Cần nhiều lần gọi API
- **Fixed structure**: Không thể tùy chỉnh response

### ⚡ **GraphQL API (Cách hiện đại)**

```graphql
# Lấy chỉ name và email của user
{
  user(id: "1") {
    name
    email
  }
}

# Lấy nhiều thứ trong một lần gọi
{
  user(id: "1") {
    name
    email
  }
  users(limit: 3) {
    id
    name
  }
  searchUsers(email: "gmail", limit: 5) {
    data {
      name
      email
    }
    nextCursor
    hasMore
  }
}
```

**✅ Ưu điểm của GraphQL:**

- **Exact data**: Chỉ lấy dữ liệu cần thiết
- **Single request**: Một lần gọi cho nhiều thứ
- **Flexible**: Client tự quyết định cấu trúc response
- **Strongly typed**: Schema rõ ràng

---

## Cấu trúc GraphQL trong project

```
src/graphql/
├── schema.js          # Định nghĩa cấu trúc dữ liệu và API
└── resolvers.js       # Logic xử lý các truy vấn
```

### 📁 **File quan trọng:**

**1. `src/server.js`** - Cấu hình GraphQL endpoint
**2. `src/graphql/schema.js`** - Định nghĩa schema
**3. `src/graphql/resolvers.js`** - Logic xử lý

---

## Kiến trúc API song song: GraphQL và REST

Một điểm đặc biệt quan trọng trong project này là việc triển khai **cả hai API (GraphQL và REST) cùng lúc**. Chúng không phải là hai hệ thống gọi qua lại lẫn nhau, mà là hai "cửa" riêng biệt để truy cập vào cùng một lớp logic xử lý dữ liệu.

### 🏛️ **Sơ đồ kiến trúc**

Sơ đồ dưới đây minh họa cách hai hệ thống này hoạt động song song:

```
   Client (Browser, App)                   Client (GraphQL Playground)
           |                                           |
 (HTTP Request: GET /api/users/1)         (GraphQL Query: { user(id:"1"){name} })
           |                                           |
           v                                           v
+---------------------------+             +--------------------------------------+
|   **CỬA VÀO REST API**    |             |   **CỬA VÀO GRAPHQL**                |
|---------------------------|             |--------------------------------------|
| `userRoutes.js`           |             | `schema.js` (Định nghĩa "menu")     |
|           |               |             | `resolvers.js` (Cung cấp logic)      |
|           v               |             |                                      |
| `userController.js`       |             |                                      |
+---------------------------+             +--------------------------------------+
           |                                           |
           +---------------------+---------------------+
                                 |
                                 v
+--------------------------------------------------------------------------+
|                        **LỚP LOGIC DÙNG CHUNG**                          |
|--------------------------------------------------------------------------|
|                            `models/User.js`                              |
| - getUserById()
| - createUser()
| - updateUser()
| ...                                                                      |
+--------------------------------------------------------------------------+
                                 |
                                 v
                      +-----------------------+
                      | Database (PostgreSQL) |
                      +-----------------------+
```

### 🔑 **Vai trò của từng thành phần**

1.  **`src/controllers/userController.js` (Lối vào REST)**

    - **Nhiệm vụ**: Xử lý các request HTTP truyền thống (`GET`, `POST`, `PUT`, `DELETE`).
    - **Cách hoạt động**: Nhận request từ `userRoutes.js`, trích xuất dữ liệu (`req.params`, `req.body`), **gọi hàm trong `models/User.js`**, sau đó tự định dạng và gửi response JSON về cho client.

2.  **`src/graphql/resolvers.js` (Lối vào GraphQL)**

    - **Nhiệm vụ**: Cung cấp logic thực thi cho các field được định nghĩa trong `schema.js`.
    - **Cách hoạt động**: Khi GraphQL Engine nhận một query, nó sẽ tìm resolver tương ứng, **gọi hàm trong `models/User.js`**, và trả về dữ liệu thô. GraphQL Engine sẽ tự động lọc và định dạng response cuối cùng dựa trên yêu cầu của client.

3.  **`src/models/User.js` (Lớp logic chung)**
    - **Trái tim của ứng dụng**: Đây là nơi duy nhất chứa logic nghiệp vụ cốt lõi để tương tác với database.
    - **Tái sử dụng code**: Bằng cách tập trung logic vào model, cả `userController.js` và `resolvers.js` đều có thể sử dụng lại mà không cần lặp lại code. Nếu bạn thay đổi logic trong model, cả hai API sẽ tự động được cập nhật.

### ⚖️ **So sánh trực tiếp**

| Tiêu chí             | `userController.js` (REST)          | `resolvers.js` (GraphQL)                        |
| :------------------- | :---------------------------------- | :---------------------------------------------- |
| **Mục đích**         | Xử lý các endpoint REST riêng lẻ    | Cung cấp logic cho các field trong schema       |
| **Đầu vào**          | `req` (request) và `res` (response) | `args` (tham số từ query)                       |
| **Gọi Model**        | `User.getUserById(req.params.id)`   | `User.getUserById(args.id)`                     |
| **Định dạng Output** | Tự định dạng JSON (`res.json(...)`) | Trả về dữ liệu thô, GraphQL Engine tự định dạng |
| **Mối quan hệ**      | **Không** gọi đến `resolvers.js`    | **Không** gọi đến `userController.js`           |

Kiến trúc này cho phép bạn tận dụng ưu điểm của cả hai thế giới: sự đơn giản và caching mạnh mẽ của REST, cùng với sự linh hoạt và hiệu quả của GraphQL.

---

## Cách hoạt động của GraphQL

### 🔄 **Quy trình xử lý:**

```
1. Client gửi GraphQL query đến /graphql
     ↓
2. Server nhận query và phân tích
     ↓
3. GraphQL engine tìm resolver tương ứng
     ↓
4. Resolver thực thi logic và trả về dữ liệu
     ↓
5. GraphQL engine format dữ liệu theo yêu cầu
     ↓
6. Server trả về response cho client
```

### 📝 **Ví dụ cụ thể:**

```javascript
// 1. Client gửi query
const query = `{ 
  user(id: "1") { 
    name
    email
  }
}`;

// 2. GraphQL engine phân tích query
// - Field: user
// - Argument: id = "1"
// - Requested fields: name, email

// 3. Tìm resolver cho field "user"
// 4. Gọi resolver với argument id = "1"
// 5. Resolver trả về user object
// 6. GraphQL chỉ trả về name và email (bỏ các field khác)
```

---

## Schema - Bản thiết kế API

Schema là **bản thiết kế** định nghĩa:

- Những dữ liệu nào có thể truy vấn
- Cấu trúc của từng kiểu dữ liệu
- Những thao tác nào có thể thực hiện

### 📋 **Phân tích schema trong project:**

```javascript
// src/graphql/schema.js
const schema = buildSchema(`
  # KIỂU DỮ LIỆU USER
  type User {
    id: ID!              # ID bắt buộc
    name: String!        # Tên bắt buộc
    email: String!       # Email bắt buộc
    created_at: String   # Thời gian tạo (tùy chọn)
    updated_at: String   # Thời gian cập nhật (tùy chọn)
  }

  # KIỂU DỮ LIỆU KẾT QUẢ TÌM KIẾM VỚI PHÂN TRANG
  type SearchUsersResult {
    data: [User]         # Mảng users tìm được
    nextCursor: ID       # Cursor cho trang tiếp theo (null nếu hết)
    hasMore: Boolean     # Có còn dữ liệu hay không
  }

  # CÁC TRUY VẤN ĐỌC DỮ LIỆU
  type Query {
    hello: String                                    # Test kết nối
    user(id: ID!): User                             # Lấy 1 user
    users(cursor: ID, limit: Int): [User]           # Lấy danh sách user
    searchUsers(email: String, name: String, cursor: ID, limit: Int): SearchUsersResult # Tìm kiếm user với phân trang
  }

  # CÁC THAO TÁC THAY ĐỔI DỮ LIỆU
  type Mutation {
    createUser(name: String!, email: String!): User      # Tạo user
    updateUser(id: ID!, name: String, email: String): User # Sửa user
    deleteUser(id: ID!): User                           # Xóa user
  }
`);
```

### 🔍 **Giải thích từng thành phần:**

**1. Type definitions (Định nghĩa kiểu)**

```graphql
type User {
  id: ID! # ! có nghĩa là bắt buộc (required)
  name: String! # String là kiểu dữ liệu
  email: String!
}
```

**2. Query type (Truy vấn đọc)**

```graphql
type Query {
  user(id: ID!): User # Hàm user nhận tham số id, trả về User
  users: [User] # [User] có nghĩa là mảng các User
}
```

**3. Mutation type (Thay đổi dữ liệu)**

```graphql
type Mutation {
  createUser(name: String!, email: String!): User
  # Hàm createUser nhận name và email, trả về User mới tạo
}
```

---

## Resolvers - Logic xử lý

Resolver là **hàm JavaScript** thực hiện logic cho từng field trong schema.

### 🔧 **Cấu trúc resolver:**

```javascript
// src/graphql/resolvers.js
const root = {
  // QUERY RESOLVERS - Xử lý truy vấn đọc
  hello: () => {
    return "Hello World!";
  },

  user: async ({ id }) => {
    // Logic: Lấy user từ database theo ID, theo hệ 10
    return User.getUserById(parseInt(id, 10));
  },

  users: async ({ cursor, limit }) => {
    // Logic: Lấy danh sách users với phân trang
    const result = await User.getUsers(cursor, limit);
    return result.data;
  },

  searchUsers: async ({ email, name, cursor, limit }) => {
    // Logic: Tìm kiếm users theo tiêu chí với cursor-based pagination
    const criteria = {};
    if (email) criteria.email = email; // Chỉ thêm email nếu có truyền vào
    if (name) criteria.name = name; // Chỉ thêm name nếu có truyền vào

    const parsedCursor = cursor ? parseInt(cursor, 10) : 0;
    const defaultLimit = limit || 20; // Mặc định 20 users per page

    return User.searchUsers(criteria, parsedCursor, defaultLimit);
  },

  // MUTATION RESOLVERS - Xử lý thay đổi dữ liệu
  createUser: async ({ name, email }) => {
    // Logic: Tạo user mới trong database
    return User.createUser({ name, email });
  },

  updateUser: async ({ id, name, email }) => {
    // Logic: Cập nhật user trong database
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    return User.updateUser(parseInt(id, 10), updateData);
  },
};
```

### 🎯 **Cách resolver hoạt động:**

```javascript
// Khi client gửi query:
{
  user(id: "1") {
    name
    email
  }
}

// GraphQL engine sẽ:
// 1. Tìm resolver "user"
// 2. Gọi user({ id: "1" })
// 3. Resolver trả về user object: { id: 1, name: "John", email: "john@email.com", created_at: "...", updated_at: "..." }
// 4. GraphQL chỉ trả về name và email: { name: "John", email: "john@email.com" }
```

---

## Phân quyền và Bảo mật trong GraphQL

Vì GraphQL chỉ sử dụng một endpoint duy nhất, chúng ta không thể phân quyền dựa trên URL như REST (ví dụ: bảo vệ route `/api/admin`). Thay vào đó, việc phân quyền trong GraphQL được thực hiện ở một lớp sâu hơn và linh hoạt hơn.

> **Nguyên tắc cốt lõi**: Quyền truy cập trong GraphQL được quản lý ở **cấp độ field (trường) bên trong các resolver**, bằng cách sử dụng **đối tượng `context`**.

### 🔐 **Quy trình phân quyền**

Luồng xử lý bao gồm 3 bước chính: Xác thực -> Tạo Context -> Phân quyền.

#### **Bước 1: Xác thực (Authentication) - _Bạn là ai?_**

Bước này diễn ra **trước khi** request được xử lý bởi GraphQL, thường là ở một lớp middleware của server (ví dụ: Express middleware).

1.  Client gửi request đến `/graphql` kèm theo một bằng chứng xác thực (ví dụ: `Bearer Token` trong header `Authorization`).
2.  Middleware của server đọc và giải mã token để lấy thông tin người dùng (ví dụ: `userId`, `role`).
3.  Nếu token hợp lệ, thông tin người dùng được gắn vào đối tượng `request` (ví dụ: `req.user`). Nếu không, request bị từ chối.

#### **Bước 2: Tạo đối tượng `context`**

`context` là một object được chia sẻ cho **tất cả các resolver** trong cùng một query. Đây là cầu nối giữa lớp xác thực và lớp GraphQL.

Khi cấu hình `express-graphql`, chúng ta sẽ truyền thông tin user đã được xác thực vào `context`:

```javascript
// Trong file src/server.js (ví dụ)
const { graphqlHTTP } = require("express-graphql");
const { authenticate } = require("./middleware/auth"); // Middleware xác thực tự viết

app.use(
  "/graphql",
  authenticate, // Middleware này chạy trước, giải mã token và gắn user vào req
  graphqlHTTP((req) => ({
    schema: schema,
    rootValue: root,
    graphiql: true,
    // TẠO CONTEXT: Truyền thông tin user từ request vào context
    context: {
      user: req.user, // req.user được tạo bởi middleware `authenticate`
    },
  }))
);
```

#### **Bước 3: Kiểm tra quyền trong Resolver (Authorization) - _Bạn được phép làm gì?_**

Bây giờ, mỗi resolver có thể truy cập `context` để kiểm tra quyền của người dùng trước khi thực thi logic. Resolver function thực chất có 4 tham số: `(args, context, info)`.

**Ví dụ: Chỉ cho phép `admin` xóa người dùng.**

```javascript
// src/graphql/resolvers.js

deleteUser: async (args, context) => {
    // 1. Lấy user từ context
    const currentUser = context.user;

    // 2. Kiểm tra xác thực: User đã đăng nhập chưa?
    if (!currentUser) {
        throw new Error('Authentication required. Please log in.');
    }

    // 3. Kiểm tra quyền: User có phải là admin không?
    if (currentUser.role !== 'admin') {
        throw new Error('Authorization failed. You do not have permission to delete users.');
    }

    // 4. Nếu có quyền, thực thi logic
    const { id } = args;
    return User.deleteUser(parseInt(id, 10));
},
```

### ✨ **Chiến lược nâng cao (Khuyến khích)**

Việc kiểm tra quyền trực tiếp trong resolver có thể gây lặp code. Để code sạch hơn, bạn nên sử dụng các thư viện middleware cho GraphQL như **`graphql-shield`** hoặc **`graphql-middleware`**.

**Ý tưởng với `graphql-shield`:**

Bạn sẽ định nghĩa các quy tắc (rules) một cách riêng biệt và áp dụng chúng cho schema một cách khai báo.

```javascript
// permissions.js (ví dụ ý tưởng)
const { rule, shield } = require("graphql-shield");

// Quy tắc: User đã đăng nhập chưa?
const isAuthenticated = rule()((parent, args, context) => {
  return context.user !== null;
});

// Quy tắc: User có phải admin không?
const isAdmin = rule()((parent, args, context) => {
  return context.user.role === "admin";
});

// Áp dụng các quy tắc cho schema
const permissions = shield({
  Query: {
    user: isAuthenticated, // Ai cũng xem được user nếu đã đăng nhập
    users: isAdmin, // Chỉ admin được xem danh sách users
  },
  Mutation: {
    deleteUser: isAdmin, // Chỉ admin được xóa user
  },
});
```

Cách tiếp cận này giúp tách biệt hoàn toàn logic phân quyền ra khỏi logic nghiệp vụ, làm cho code của bạn dễ đọc và dễ bảo trì hơn rất nhiều.

---

## Ví dụ thực tế

### 🎮 **Scenario: Lấy thông tin user**

#### **Cách REST (cũ):**

```bash
# Gọi API REST
curl http://localhost:3001/api/users/uid/1

# Response (nhận TẤT CẢ dữ liệu):
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "created_at": "2025-08-04T10:30:00.000Z",
    "updated_at": "2025-08-04T10:30:00.000Z"
  }
}
```

#### **Cách GraphQL (mới):**

```bash
# Gọi GraphQL API - CHỈ LẤY name và email
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ user(id: \"1\") { name email } }"
  }'

# Response (chỉ nhận dữ liệu CẦN THIẾT):
{
  "data": {
    "user": {
      "name": "Nguyễn Văn A",
      "email": "nguyenvana@example.com"
    }
  }
}
```

### 🚀 **Scenario: Lấy nhiều dữ liệu cùng lúc**

#### **Cách REST (phải gọi nhiều lần):**

```bash
# Lấy user
curl http://localhost:3001/api/users/uid/1

# Lấy danh sách users
curl http://localhost:3001/api/users

# Phải gọi 2 lần API!
```

#### **Cách GraphQL (chỉ 1 lần gọi):**

```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{
      user(id: \"1\") { name email }
      users(limit: 3) { id name }
    }"
  }'

# Response (tất cả dữ liệu trong 1 lần):
{
  "data": {
    "user": {
      "name": "Nguyễn Văn A",
      "email": "nguyenvana@example.com"
    },
    "users": [
      { "id": "1", "name": "Nguyễn Văn A" },
      { "id": "2", "name": "Trần Thị B" },
      { "id": "3", "name": "Lê Văn C" }
    ]
  }
}
```

### 🔧 **Scenario: Tạo user mới**

#### **Cách REST:**

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "User Mới", "email": "usermoi@example.com"}'
```

#### **Cách GraphQL:**

```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createUser(name: \"User Mới\", email: \"usermoi@example.com\") { id name email created_at } }"
  }'
```

### 🔄 **Scenario: Cập nhật thông tin user (Update User)**

#### **🚨 QUAN TRỌNG: Cách sửa 2 API updateUser đã được khắc phục**

Trước đây có lỗi với mutation `updateUser`, nhưng hiện tại đã được sửa và hoạt động bình thường. Dưới đây là 2 ví dụ API đã được khắc phục:

#### **1. Cập nhật chỉ tên user (Update name only):**

```bash
# ✅ API đã được khắc phục - hoạt động bình thường
curl --location 'http://localhost:3001/graphql' \
--header 'Content-Type: application/json' \
--data '{
    "query": "mutation { updateUser(id: \"1\", name: \"Lê Văn Chi\") { id name email updated_at } }"
}'
```

**Response thành công:**

```json
{
  "data": {
    "updateUser": {
      "id": "1",
      "name": "Lê Văn Chi",
      "email": "existing@example.com",
      "updated_at": "2025-08-04T12:30:00.000Z"
    }
  }
}
```

#### **2. Cập nhật chỉ email user (Update email only):**

```bash
# ✅ API đã được khắc phục - hoạt động bình thường
curl --location 'http://localhost:3001/graphql' \
--header 'Content-Type: application/json' \
--data-raw '{
    "query": "mutation { updateUser(id: \"1\", email: \"newemail@example.com\") { id name email updated_at } }"
}'
```

**Response thành công:**

```json
{
  "data": {
    "updateUser": {
      "id": "1",
      "name": "Lê Văn Chi",
      "email": "newemail@example.com",
      "updated_at": "2025-08-04T12:35:00.000Z"
    }
  }
}
```

#### **🔍 Giải thích cách hoạt động của UpdateUser:**

**1. Tính linh hoạt của GraphQL mutation updateUser:**

- Bạn có thể cập nhật **chỉ name** mà không cần truyền email
- Bạn có thể cập nhật **chỉ email** mà không cần truyền name
- Bạn cũng có thể cập nhật **cả name và email** cùng lúc

**2. Schema của updateUser:**

```graphql
type Mutation {
  updateUser(id: ID!, name: String, email: String): User
}
```

**Giải thích:**

- `id: ID!` - Bắt buộc (required) - ID của user cần cập nhật
- `name: String` - Tùy chọn (optional) - Tên mới (nếu muốn đổi)
- `email: String` - Tùy chọn (optional) - Email mới (nếu muốn đổi)

**3. Logic xử lý trong resolver:**

```javascript
updateUser: async ({ id, name, email }) => {
  // Tạo object updateData rỗng
  const updateData = {};

  // Chỉ thêm field nào được truyền vào
  if (name) updateData.name = name; // Chỉ update name nếu có truyền
  if (email) updateData.email = email; // Chỉ update email nếu có truyền

  // Gọi model để update user
  return User.updateUser(parseInt(id, 10), updateData);
};
```

#### **🎯 Các cách sử dụng updateUser khác nhau:**

**Ví dụ 1: Cập nhật cả name và email:**

```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { updateUser(id: \"1\", name: \"Tên Mới\", email: \"email@moi.com\") { id name email updated_at } }"
  }'
```

**Ví dụ 2: Sử dụng Variables (khuyến khích):**

```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation($id: ID!, $name: String, $email: String) { updateUser(id: $id, name: $name, email: $email) { id name email updated_at } }",
    "variables": { "id": "1", "name": "Lê Văn Chi", "email": "levanchi@example.com" }
  }'
```

#### **🔧 So sánh với REST API:**

**REST API (cần truyền toàn bộ object):**

```bash
# REST yêu cầu PUT với tất cả fields
curl -X PUT http://localhost:3001/api/users/uid/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lê Văn Chi",
    "email": "existing@example.com"  # Phải truyền email dù không đổi
  }'
```

**GraphQL (chỉ truyền field muốn thay đổi):**

```bash
# GraphQL chỉ cần field muốn đổi
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { updateUser(id: \"1\", name: \"Lê Văn Chi\") { id name email updated_at } }"
  }'
```

#### **🚀 Lợi ích của GraphQL updateUser:**

1. **Tiết kiệm băng thông**: Chỉ gửi dữ liệu cần thay đổi
2. **Linh hoạt cao**: Có thể update 1 field hoặc nhiều fields
3. **Ít lỗi**: Không cần lo lắng về việc ghi đè dữ liệu không mong muốn
4. **Response tùy chỉnh**: Chỉ lấy fields cần thiết trong response

#### **⚠️ Lưu ý khi sử dụng:**

1. **ID là bắt buộc**: Luôn phải truyền ID của user cần update
2. **Ít nhất 1 field**: Cần truyền ít nhất name hoặc email (hoặc cả hai)
3. **Validation**: Server sẽ validate email format và name length
4. **User phải tồn tại**: Nếu ID không tồn tại sẽ trả về lỗi

### 🔄 **Scenario: Tìm kiếm với Cursor-based Pagination**

Cursor-based pagination rất quan trọng khi xử lý tập dữ liệu lớn (ví dụ: 1 triệu users với Gmail).

#### **🚨 LƯU Ý QUAN TRỌNG: Cấu trúc SearchUsersResult**

Khi sử dụng `searchUsers`, bạn PHẢI query field `data` để lấy users thực tế:

```graphql
# ❌ SAI - Sẽ báo lỗi
{
  searchUsers(email: "gmail.com") {
    id
    name
    email
  }
}

# ✅ ĐÚNG - Phải query field data
{
  searchUsers(email: "gmail.com") {
    data {
      id
      name
      email
    }
    nextCursor
    hasMore
  }
}
```

**Giải thích:**

- `searchUsers` trả về `SearchUsersResult` object (không phải array Users)
- `SearchUsersResult` có 3 fields: `data`, `nextCursor`, `hasMore`
- Users thực tế nằm trong field `data`
- `nextCursor` và `hasMore` dùng cho pagination

#### **Cách GraphQL xử lý phân trang hiệu quả:**

```bash
# Tìm kiếm trang đầu tiên (20 users có gmail)
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ searchUsers(email: \"gmail.com\", limit: 20) { data { id name email } nextCursor hasMore } }"
  }'

# Response:
{
  "data": {
    "searchUsers": {
      "data": [
        { "id": "1", "name": "John Doe", "email": "john@gmail.com" },
        { "id": "5", "name": "Jane Smith", "email": "jane@gmail.com" },
        // ... 18 users nữa
      ],
      "nextCursor": "25",  # ID của user cuối cùng
      "hasMore": true      # Còn nhiều dữ liệu
    }
  }
}
```

```bash
# Tìm kiếm trang tiếp theo (sử dụng cursor từ response trước)
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ searchUsers(email: \"gmail.com\", cursor: \"25\", limit: 20) { data { id name email } nextCursor hasMore } }"
  }'

# Response:
{
  "data": {
    "searchUsers": {
      "data": [
        { "id": "26", "name": "Mike Johnson", "email": "mike@gmail.com" },
        // ... 19 users nữa với ID > 25
      ],
      "nextCursor": "50",
      "hasMore": true
    }
  }
}
```

#### **Tại sao Cursor-based Pagination tốt hơn Offset-based?**

**❌ Offset-based pagination (LIMIT/OFFSET):**

```sql
-- Trang 1000 với 20 items/trang = OFFSET 19980
SELECT * FROM users WHERE email ILIKE '%gmail%' LIMIT 20 OFFSET 19980;
-- Database phải đếm và bỏ qua 19,980 records -> CHẬM!
```

**✅ Cursor-based pagination (ID > cursor):**

```sql
-- Chỉ lấy records có ID > cursor
SELECT * FROM users WHERE email ILIKE '%gmail%' AND id > 19980 LIMIT 20;
-- Database sử dụng index trên ID -> NHANH!
```

**Ưu điểm của Cursor-based:**

- **Performance**: Không bị chậm khi pagination sâu
- **Consistency**: Không bị duplicate/missing data khi có insert/delete
- **Scalability**: Hiệu quả với millions of records

#### **🛠️ Lỗi thường gặp và cách khắc phục**

**1. Lỗi query field trực tiếp trên SearchUsersResult:**

```bash
# ❌ Query sai - gây lỗi
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ searchUsers(email: \"gmail.com\") { id name email } }"}'

# Lỗi trả về:
# "message": "Cannot query field \"id\" on type \"SearchUsersResult\""
```

```bash
# ✅ Query đúng - hoạt động bình thường
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ searchUsers(email: \"gmail.com\") { data { id name email } nextCursor hasMore } }"}'

# Response thành công:
{
  "data": {
    "searchUsers": {
      "data": [
        {"id": "3", "name": "Steve Schoen V", "email": "lenny_harber@gmail.com"},
        {"id": "4", "name": "Mr. Antonio Wintheiser", "email": "mike_jacobson46@gmail.com"}
      ],
      "nextCursor": "52",
      "hasMore": true
    }
  }
}
```

**2. Sử dụng với Variables:**

```bash
# ✅ Đúng cách với variables
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query($email: String, $name: String) { searchUsers(email: $email, name: $name) { data { id name email } nextCursor hasMore } }",
    "variables": {"email": "gmail.com", "name": "Nguyễn"}
  }'
```

---

## Ưu nhược điểm

### ✅ **Ưu điểm của GraphQL:**

**1. Tiết kiệm băng thông**

- Chỉ lấy dữ liệu cần thiết
- Giảm dung lượng response

**2. Giảm số lần gọi API**

- Một query có thể lấy nhiều dữ liệu
- Hiệu suất tốt hơn cho mobile apps

**3. Flexibility cao**

- Client tự quyết định cấu trúc response
- Dễ thay đổi frontend mà không cần sửa backend

**4. Strong typing**

- Schema rõ ràng, ít bug
- IDE support tốt (autocomplete, validation)

**5. Self-documenting**

- Schema tự động tạo documentation
- Playground để test API

**6. Versionless**

- Không cần versioning như REST v1, v2, v3
- Thêm field mới mà không phá backward compatibility

**7. Advanced Pagination**

- Cursor-based pagination native support
- Hiệu quả với large datasets (millions of records)
- Consistent results khi có concurrent modifications

### ❌ **Nhược điểm của GraphQL:**

**1. Learning curve**

- Phức tạp hơn REST
- Cần học syntax mới

**2. Over-engineering**

- Phức tạp cho API đơn giản
- Setup ban đầu nhiều code

**3. Caching khó hơn**

- HTTP caching không hoạt động tốt
- Cần caching strategy phức tạp

**4. File upload phức tạp**

- Không native support file upload
- Cần thêm multipart/form-data handling

**5. Performance concerns**

- Có thể tạo query phức tạp làm chậm server
- Cần query complexity analysis

---

## Khi nào nên dùng GraphQL

### 🎯 **NÊN dùng GraphQL khi:**

**1. Mobile applications**

- Băng thông hạn chế
- Cần optimize performance

**2. Complex data relationships**

- Dữ liệu có nhiều mối quan hệ
- Cần aggregate data từ nhiều nguồn

**3. Multiple clients**

- Web, mobile, desktop cần dữ liệu khác nhau
- Mỗi client muốn control response structure

**4. Rapid development**

- Frontend cần thay đổi nhanh
- Không muốn phụ thuộc backend team

**5. Microservices**

- Aggregate data từ nhiều services
- GraphQL gateway pattern

### ❌ **KHÔNG nên dùng GraphQL khi:**

**1. Simple CRUD applications**

- API đơn giản
- REST đã đủ

**2. File upload heavy**

- Chủ yếu upload/download files
- REST tốt hơn

**3. Caching requirements**

- Cần HTTP caching mạnh mẽ
- CDN caching quan trọng

**4. Small team/learning constraints**

- Team chưa có kinh nghiệm
- Timeline gấp

**5. Legacy systems**

- Hệ thống cũ khó thay đổi
- Integration với external APIs nhiều

---

## So sánh chi tiết REST vs GraphQL

| Tiêu chí           | REST                                  | GraphQL                      |
| ------------------ | ------------------------------------- | ---------------------------- |
| **Endpoint**       | Nhiều URL (/users, /posts, /comments) | Một URL (/graphql)           |
| **Data fetching**  | Fixed structure                       | Flexible structure           |
| **Over-fetching**  | Có (lấy dữ liệu thừa)                 | Không (chỉ lấy cần thiết)    |
| **Under-fetching** | Có (cần gọi nhiều API)                | Không (một query nhiều data) |
| **Caching**        | HTTP caching tốt                      | Phức tạp hơn                 |
| **File upload**    | Native support                        | Cần custom handling          |
| **Learning curve** | Dễ học                                | Khó hơn                      |
| **Tooling**        | Mature ecosystem                      | Đang phát triển              |
| **Error handling** | HTTP status codes                     | GraphQL error format         |
| **Versioning**     | /v1, /v2, /v3                         | Schema evolution             |

---

## Kết luận

**GraphQL** là một công nghệ mạnh mẽ phù hợp cho:

- Ứng dụng phức tạp với nhiều loại client
- Mobile apps cần optimize performance
- Rapid development với requirements thay đổi thường xuyên

**REST** vẫn là lựa chọn tốt cho:

- Ứng dụng đơn giản
- File upload/download heavy
- Team mới bắt đầu

Trong project này, chúng ta có **CẢ HAI** để bạn có thể so sánh và chọn phương pháp phù hợp với từng tình huống!

---

## Tài liệu tham khảo

- **GraphQL Playground**: http://localhost:3001/graphql
- **REST API Docs**: http://localhost:3001/api-docs
- **Source code**: `src/graphql/` folder
- **Schema file**: `src/graphql/schema.js`
- **Resolvers file**: `src/graphql/resolvers.js`

**Chúc bạn học tốt GraphQL! 🚀**
