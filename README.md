# Node.js REST API with GraphQL

Simple REST API backend built with Node.js, Express.js using MVC architecture pattern, with GraphQL support.

## 📋 Features

- **REST API**: CRUD operations for User management
- **GraphQL API**: Flexible query language with single endpoint
- **Swagger Documentation**: Interactive API documentation
- Input validation and error handling
- Health check endpoint
- Docker containerization
- Production-ready setup
- **Security testing with OWASP ZAP**

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (optional)
- **Docker for ZAP security testing**

### Local Development

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd nodejs-rest-api
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the server**

   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

4. **Verify the server is running**
   ```bash
   curl http://localhost:3001/health
   ```

Expected response:

```json
{
  "success": true,
  "message": "Server đang hoạt động",
  "timestamp": "2025-08-04T10:30:00.000Z"
}
```

5. **Access APIs and Documentation**
   - **GraphQL Playground**: http://localhost:3001/graphql
   - **REST API Docs**: http://localhost:3001/api-docs
   - **Health Check**: http://localhost:3001/health

## 🔄 API Options: REST vs GraphQL

This API provides **two ways** to access data:

### 🌐 **REST API** (Traditional)

- Multiple endpoints for different operations
- Fixed response structure
- HTTP verbs (GET, POST, PUT, DELETE)
- Swagger documentation available

### ⚡ **GraphQL API** (Modern)

- Single endpoint `/graphql`
- Flexible queries - request exactly what you need
- Real-time introspection
- Built-in playground for testing

### 🎯 **When to Use Which?**

| Use Case                  | REST API             | GraphQL             |
| ------------------------- | -------------------- | ------------------- |
| Simple CRUD operations    | ✅ Recommended       | ✅ Works great      |
| Complex nested queries    | ❌ Multiple requests | ✅ Single request   |
| Mobile apps (bandwidth)   | ❌ Over-fetching     | ✅ Minimal data     |
| Legacy system integration | ✅ Standard          | ❌ May need adapter |
| Learning curve            | ✅ Familiar          | ❌ New syntax       |

---

## 📡 REST API Endpoints

### Base URL

```
http://localhost:3001
```

### Health Check

```http
GET /health
```

### User Management

| Method | Endpoint             | Description     |
| ------ | -------------------- | --------------- |
| GET    | `/api/users`         | Get all users   |
| GET    | `/api/users/uid/:id` | Get user by ID  |
| POST   | `/api/users`         | Create new user |
| PUT    | `/api/users/uid/:id` | Update user     |
| DELETE | `/api/users/uid/:id` | Delete user     |

### Request Examples

#### Get all users

```bash
curl http://localhost:3001/api/users
```

#### Get user by ID

```bash
curl http://localhost:3001/api/users/uid/1
```

#### Create new user

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@email.com"
  }'
```

#### Update user

```bash
curl -X PUT http://localhost:3001/api/users/uid/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn A - Updated",
    "email": "nguyenvana@email.com"
  }'
```

#### Delete user

```bash
curl -X DELETE http://localhost:3001/api/users/uid/1
```

---

## ⚡ GraphQL API

### 🎯 **GraphQL Endpoint**

```
POST http://localhost:3001/graphql
GET  http://localhost:3001/graphql  (Playground UI)
```

### 🚀 **Getting Started with GraphQL**

1. **Open GraphQL Playground**: http://localhost:3001/graphql
2. **Write your first query** in the left panel
3. **Click Play button** to execute
4. **See results** in the right panel

### 📋 **Available Operations**

#### **Queries (Read Data)**

```graphql
type Query {
  hello: String # Test connection
  user(id: ID!): User # Get user by ID
  users(cursor: ID, limit: Int): [User] # Get users (paginated)
  searchUsers(email: String, name: String, cursor: ID, limit: Int): SearchUsersResult # Search users with pagination
}
```

#### **Mutations (Modify Data)**

```graphql
type Mutation {
  createUser(name: String!, email: String!): User # Create user
  updateUser(id: ID!, name: String, email: String): User # Update user
  deleteUser(id: ID!): User # Delete user
}
```

#### **User Type**

```graphql
type User {
  id: ID! # Unique identifier
  name: String! # User name (required)
  email: String! # User email (required)
  created_at: String # Creation timestamp
  updated_at: String # Last update timestamp
}
```

#### **SearchUsersResult Type**

```graphql
type SearchUsersResult {
  data: [User] # Array of users found
  nextCursor: ID # Cursor for next page (null if no more data)
  hasMore: Boolean # Whether there are more results
}
```

**🚨 Important: SearchUsersResult Structure**

When using `searchUsers`, you must query the `data` field to get the actual users:

```graphql
# ❌ Wrong - This will cause an error
{ searchUsers(email: "gmail.com") { id name email } }

# ✅ Correct - Query the data field
{ searchUsers(email: "gmail.com") { data { id name email } nextCursor hasMore } }
```

### 🎮 **GraphQL Examples**

#### **1. Test Connection**

```graphql
{
  hello
}
```

**Response:**

```json
{
  "data": {
    "hello": "Hello World!"
  }
}
```

#### **2. Get User by ID**

```graphql
{
  user(id: "1") {
    id
    name
    email
    created_at
  }
}
```

#### **3. Get All Users (with Pagination)**

```graphql
{
  users(limit: 5) {
    id
    name
    email
  }
}
```

#### **4. Search Users (with Cursor-based Pagination)**

```graphql
# Search first page (20 users with gmail)
{
  searchUsers(email: "gmail.com", limit: 20) {
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

**Next page with cursor:**
```graphql
{
  searchUsers(email: "gmail.com", cursor: "123", limit: 20) {
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

**Search by name with pagination:**
```graphql
{
  searchUsers(name: "Nguyễn", limit: 10) {
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

#### **5. Create New User**

```graphql
mutation {
  createUser(name: "Trần Thị B", email: "tranthib@example.com") {
    id
    name
    email
    created_at
  }
}
```

#### **6. Update User**

```graphql
mutation {
  updateUser(id: "1", name: "Nguyễn Văn A - Updated") {
    id
    name
    email
    updated_at
  }
}
```

#### **7. Delete User**

```graphql
mutation {
  deleteUser(id: "1") {
    id
    name
    email
  }
}
```

### 🌐 **Using GraphQL with curl**

#### **1. Test Connection**

```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ hello }"
  }'
```

#### **2. Get User by ID**

```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ user(id: \"1\") { id name email created_at updated_at } }"
  }'
```

**With Variables:**
```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query($id: ID!) { user(id: $id) { id name email created_at } }",
    "variables": { "id": "1" }
  }'
```

#### **3. Get All Users (with Pagination)**

```bash
# Get first 5 users
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ users(limit: 5) { id name email } }"
  }'
```

**With cursor pagination:**
```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ users(cursor: \"5\", limit: 3) { id name email created_at } }"
  }'
```

**Using Variables:**
```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query($cursor: ID, $limit: Int) { users(cursor: $cursor, limit: $limit) { id name email } }",
    "variables": { "cursor": "5", "limit": 3 }
  }'
```

#### **4. Search Users**

```bash
# Search by email domain
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ searchUsers(email: \"gmail.com\") { data { id name email } nextCursor hasMore } }"
  }'
```

```bash
# Search by name
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ searchUsers(name: \"Nguyễn\") { data { id name email } nextCursor hasMore } }"
  }'
```

**Search with both parameters:**
```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ searchUsers(email: \"gmail\", name: \"John\") { data { id name email created_at } nextCursor hasMore } }"
  }'
```

**Using Variables:**
```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query($email: String, $name: String) { searchUsers(email: $email, name: $name) { data { id name email } nextCursor hasMore } }",
    "variables": { "email": "gmail.com", "name": "John" }
  }'
```

#### **5. Create New User**

```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createUser(name: \"Trần Thị B\", email: \"tranthib@example.com\") { id name email created_at } }"
  }'
```

**Using Variables:**
```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation($name: String!, $email: String!) { createUser(name: $name, email: $email) { id name email created_at } }",
    "variables": { "name": "Lê Văn C", "email": "levanc@example.com" }
  }'
```

#### **6. Update User**

```bash
# Update name only
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { updateUser(id: \"1\", name: \"Lê Văn Chi\") { id name email updated_at } }"
  }'
```

```bash
# Update email only
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { updateUser(id: \"1\", email: \"newemail@example.com\") { id name email updated_at } }"
  }'
```

```bash
# Update both name and email
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { updateUser(id: \"1\", name: \"New Name\", email: \"newemail@example.com\") { id name email updated_at } }"
  }'
```

**Using Variables:**
```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation($id: ID!, $name: String, $email: String) { updateUser(id: $id, name: $name, email: $email) { id name email updated_at } }",
    "variables": { "id": "1", "name": "Updated Name", "email": "updated@example.com" }
  }'
```

#### **7. Delete User**

```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { deleteUser(id: \"1\") { id name email } }"
  }'
```

**Using Variables:**
```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation($id: ID!) { deleteUser(id: $id) { id name email } }",
    "variables": { "id": "1" }
  }'
```

#### **8. Multiple Operations in One Request**

```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ allUsers: users { id } firstUser: user(id: \"1\") { name email } searchResults: searchUsers(email: \"gmail\") { data { name } hasMore } }"
  }'
```

#### **9. Custom Field Selection Examples**

```bash
# Get only names
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ users { name } }"
  }'
```

```bash
# Get only IDs and emails
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ users { id email } }"
  }'
```

### 📱 **GraphQL Response Examples**

#### **Successful Response:**
```json
{
  "data": {
    "users": [
      {
        "id": "1",
        "name": "Nguyễn Văn A",
        "email": "nguyenvana@example.com"
      }
    ]
  }
}
```

#### **Error Response:**
```json
{
  "errors": [
    {
      "message": "User not found",
      "locations": [{"line": 2, "column": 3}],
      "path": ["user"]
    }
  ],
  "data": {
    "user": null
  }
}
```

---

## 📝 Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@email.com"
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Validation error 1", "Validation error 2"]
}
```

## 🗂️ Project Structure

```
nodejs-rest-api/
├── src/
│   ├── server.js              # Main server file
│   ├── controllers/
│   │   └── userController.js  # Business logic
│   ├── routes/
│   │   └── userRoutes.js      # Route definitions
│   ├── models/
│   │   └── User.js            # Data model & validation
│   ├── middleware/
│   │   ├── errorHandler.js    # Error handling
│   │   └── notFoundHandler.js # 404 handler
│   ├── config/
│   │   ├── db.js              # Database configuration
│   │   └── swagger.js         # Swagger configuration
│   └── graphql/
│       ├── schema.js          # GraphQL schema definitions
│       └── resolvers.js       # GraphQL resolvers
├── scripts/
│   └── seed.js                # Database seeding
├── Dockerfile                 # Docker configuration
├── docker-compose.yml         # Docker Compose setup
├── package.json               # Dependencies
└── README.md                  # Documentation
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=production
PORT=3001
```

## 🔍 Validation Rules

### User Object

- **name**: Required, minimum 2 characters
- **email**: Required, valid email format, unique

### Example validation errors:

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": ["Tên không được để trống", "Email không đúng định dạng"]
}
```

## 🚨 Error Handling

The API handles various error scenarios:

- **400 Bad Request**: Invalid input data
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate email
- **500 Internal Server Error**: Server errors

## 📚 API Documentation

### 📖 **Interactive Documentation**

This API provides **comprehensive documentation** for both REST and GraphQL:

#### **🌐 REST API Documentation (Swagger)**

**Access:** http://localhost:3001/api-docs

- **Interactive testing**: Try REST endpoints directly in browser
- **Complete schemas**: Request/response validation
- **Examples**: Multiple request examples for each endpoint
- **Error handling**: Comprehensive error response documentation

#### **⚡ GraphQL Documentation (Playground)**

**Access:** http://localhost:3001/graphql

- **Visual query builder**: Build queries with autocomplete
- **Schema introspection**: Explore all available operations
- **Real-time validation**: Instant feedback on query syntax
- **Variable support**: Test queries with dynamic values

### 🎯 **Using the Documentation**

#### **For REST API (Swagger):**

1. Open http://localhost:3001/api-docs
2. Browse available endpoints
3. Click **"Try it out"** to test endpoints
4. Fill in parameters and click **"Execute"**
5. View the response

#### **For GraphQL (Playground):**

1. Open http://localhost:3001/graphql
2. Write your query in the left panel
3. Use **Ctrl+Space** for autocomplete
4. Click the **Play button** to execute
5. View results in the right panel

## 🐳 Docker Deployment

### Development with Docker

1. **Build the image**

   ```bash
   docker build -t nodejs-rest-api .
   ```

2. **Run the container**

   ```bash
   docker run -d -p 3001:3001 --name my-api nodejs-rest-api
   ```

3. **View logs**
   ```bash
   docker logs -f my-api
   ```

### Production with Docker Compose

1. **Start services**

   ```bash
   docker-compose up -d
   ```

2. **View logs**

   ```bash
   docker-compose logs -f api
   ```

3. **Stop services**
   ```bash
   docker-compose down
   ```

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Docker build
docker build -t nodejs-rest-api .

# Docker run
docker run -p 3001:3001 nodejs-rest-api

# Docker Compose
docker-compose up -d
docker-compose logs -f api
docker-compose down
```

### 🎯 **Quick Testing Commands**

```bash
# Test REST API
curl http://localhost:3001/health
curl http://localhost:3001/api/users

# Test GraphQL API
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ hello }"}'

# Open documentation
open http://localhost:3001/api-docs      # REST docs
open http://localhost:3001/graphql       # GraphQL playground
```

## 🔧 Troubleshooting

### Common Issues

1. **Port already in use**

   ```bash
   # Check what's using port 3001
   netstat -ano | findstr :3001  # Windows
   lsof -i :3001                 # Mac/Linux

   # Use different port
   PORT=3002 npm run dev
   ```

2. **Container won't start**

   ```bash
   # Check container logs
   docker logs my-api

   # Check container status
   docker ps -a
   ```

3. **API returns 404**

   ```bash
   # Verify server is running
   curl http://localhost:3001/health

   # Check correct endpoint
   curl http://localhost:3001/api/users
   ```

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:3001/health
```

### Docker Container Health

```bash
docker ps
docker logs my-api
```

## 🎯 Production Deployment

### Option 1: Direct Docker

```bash
docker build -t nodejs-rest-api:prod .
docker run -d -p 3001:3001 --restart unless-stopped --name api-prod nodejs-rest-api:prod
```

### Option 2: Docker Compose

```bash
docker-compose -f docker-compose.yml up -d
```

### Option 3: Cloud Deployment

- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- Heroku
- DigitalOcean App Platform

## 📄 License

MIT License

---

**Built with ❤️ using Node.js, Express.js, and GraphQL**
