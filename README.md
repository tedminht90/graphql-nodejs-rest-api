# Node.js REST API

Simple REST API backend built with Node.js, Express.js using MVC architecture pattern.

## 📋 Features

- CRUD operations for User management
- Input validation and error handling
- Health check endpoint
- Docker containerization
- Production-ready setup

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (optional)

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
  "timestamp": "2025-07-28T02:00:00.000Z"
}
```

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

## 📡 API Endpoints

### Base URL

```
http://localhost:3001
```

### Health Check

```http
GET /health
```

### User Management

| Method | Endpoint             | Description                  |
| ------ | -------------------- | ---------------------------- |
| GET    | `/api/users`         | Get all users                |
| GET    | `/api/users/uid/:id` | Get user by ID               |
| POST   | `/api/users`         | Create new user              |
| POST   | `/api/users/search`  | Search users (recommended)   |
| POST   | `/api/users/query`   | Advanced GraphQL-style query |
| PUT    | `/api/users/uid/:id` | Update user                  |
| DELETE | `/api/users/uid/:id` | Delete user                  |

### Request Examples

#### Get all users

```bash
curl http://localhost:3001/api/users
```

#### Get user by ID

```bash
curl http://localhost:3001/api/users/uid/1
```

#### Search users (Recommended for production)

```bash
curl -X POST http://localhost:3001/api/users/search \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nguyenvana@email.com"
  }'
```

#### Advanced GraphQL-style query

```bash
curl -X POST http://localhost:3001/api/users/query \
  -H "Content-Type: application/json" \
  -d '{
    "where": {
      "age": { "gt": 20, "lt": 35 },
      "email": { "contains": "@gmail.com" }
    },
    "select": ["name", "email", "age"],
    "sort": { "field": "age", "direction": "desc" },
    "limit": 5
  }'
```

#### Create new user

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@email.com",
    "age": 25
  }'
```

#### Update user

```bash
curl -X PUT http://localhost:3001/api/users/uid/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn A - Updated",
    "age": 26
  }'
```

#### Delete user

```bash
curl -X DELETE http://localhost:3001/api/users/uid/1
```

## 📝 Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@email.com",
    "age": 25
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
│   └── middleware/
│       ├── errorHandler.js    # Error handling
│       └── notFoundHandler.js # 404 handler
├── Dockerfile                 # Docker configuration
├── docker-compose.yml         # Docker Compose setup
├── .dockerignore              # Docker ignore rules
├── package.json               # Dependencies
└── README.md                  # Documentation
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=production
PORT=3001
```

## 🔍 Advanced Query API (GraphQL-style)

### Overview

The `/api/users/query` endpoint provides powerful, flexible querying capabilities similar to GraphQL, allowing clients to specify exactly what data they need and how it should be filtered, sorted, and formatted.

### Query Structure

```javascript
{
  "where": {          // Filter conditions
    "email": {
      "equals": "...",     // Exact match
      "contains": "..."    // Substring search
    },
    "age": {
      "gt": 20,           // Greater than
      "lt": 30,           // Less than
      "equals": 25        // Exact match
    }
  },
  "select": ["id", "name", "email"],  // Select specific fields
  "sort": {                           // Sort results
    "field": "age",
    "direction": "desc"               // "asc" or "desc"
  },
  "limit": 10                         // Limit number of results
}
```

### Query Examples

#### 1. Find users by email domain

```bash
curl -X POST http://localhost:3001/api/users/query \
  -H "Content-Type: application/json" \
  -d '{
    "where": {
      "email": { "contains": "@gmail.com" }
    }
  }'
```

#### 2. Age range query with specific fields

```bash
curl -X POST http://localhost:3001/api/users/query \
  -H "Content-Type: application/json" \
  -d '{
    "where": {
      "age": { "gt": 25, "lt": 35 }
    },
    "select": ["name", "age"],
    "sort": { "field": "age", "direction": "asc" }
  }'
```

#### 3. Complex multi-condition query

```bash
curl -X POST http://localhost:3001/api/users/query \
  -H "Content-Type: application/json" \
  -d '{
    "where": {
      "age": { "gt": 20 },
      "email": { "contains": "@gmail.com" }
    },
    "select": ["name", "email"],
    "sort": { "field": "name", "direction": "asc" },
    "limit": 3
  }'
```

#### 4. Get youngest user

```bash
curl -X POST http://localhost:3001/api/users/query \
  -H "Content-Type: application/json" \
  -d '{
    "sort": { "field": "age", "direction": "asc" },
    "limit": 1
  }'
```

#### 5. Search with pagination

```bash
curl -X POST http://localhost:3001/api/users/query \
  -H "Content-Type: application/json" \
  -d '{
    "select": ["id", "name"],
    "sort": { "field": "id", "direction": "asc" },
    "limit": 5
  }'
```

### Supported Operators

#### Email Field Operators:

- `equals`: Exact email match
- `contains`: Email contains substring

#### Age Field Operators:

- `gt`: Greater than
- `lt`: Less than
- `equals`: Exact age match

#### Sort Options:

- `field`: Field name to sort by (`id`, `name`, `email`, `age`)
- `direction`: Sort direction (`asc` or `desc`)

#### Response Format:

```json
{
  "success": true,
  "message": "Query thành công",
  "data": [
    {
      "id": 1,
      "name": "Nguyễn Văn A",
      "email": "nguyenvana@gmail.com",
      "age": 25
    }
  ],
  "total": 1
}
```

### Use Cases

1. **Admin Dashboards**: Complex filtering and sorting
2. **Search Functionality**: Multiple search criteria
3. **Analytics**: Custom data aggregation
4. **Mobile Apps**: Minimize data transfer with field selection
5. **Reporting**: Custom data queries

### Performance Benefits

- **Reduced Bandwidth**: Only return required fields
- **Flexible Filtering**: Single endpoint for multiple query types
- **Efficient Sorting**: Server-side sorting and limiting
- **Scalable**: Easy to extend with new operators

### Manual Testing with curl

Run the test script:

**Linux/Mac:**

```bash
chmod +x test_api.sh
./test_api.sh
```

**Windows:**

```cmd
test_api.bat
```

### API Test Commands

```bash
# Health check
curl http://localhost:3001/health

# CRUD operations
curl http://localhost:3001/api/users
curl http://localhost:3001/api/users/uid/1
#curl http://localhost:3001/api/users/email/test@test.com

# Search operations
curl -X POST http://localhost:3001/api/users/search -H "Content-Type: application/json" -d '{"email":"test@test.com"}'
curl -X POST http://localhost:3001/api/users/query -H "Content-Type: application/json" -d '{"where":{"age":{"gt":25}},"limit":3}'

# Create, Update, Delete
curl -X POST http://localhost:3001/api/users -H "Content-Type: application/json" -d '{"name":"Test User","email":"test@test.com","age":25}'
curl -X PUT http://localhost:3001/api/users/uid/4 -H "Content-Type: application/json" -d '{"name":"Updated User"}'
curl -X DELETE http://localhost:3001/api/users/uid/4
```

## 🔍 Validation Rules

### User Object

- **name**: Required, minimum 2 characters
- **email**: Required, valid email format, unique
- **age**: Required, number between 1-150

### Example validation errors:

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    "Tên không được để trống",
    "Email không đúng định dạng",
    "Tuổi phải là số từ 1 đến 150"
  ]
}
```

## 🚨 Error Handling

The API handles various error scenarios:

- **400 Bad Request**: Invalid input data
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate email
- **500 Internal Server Error**: Server errors

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:3001/health
```

### Docker Container Health

```bash
docker ps
docker logs nodejs-rest-api-prod
```

### Performance Monitoring

```bash
# Container stats
docker stats nodejs-rest-api-prod

# System resources
htop
```

## 🔒 Security

- Input validation and sanitization
- Error message standardization
- Non-root user in Docker container
- Resource limits in production

## 🎯 Production Deployment

### Option 1: Direct Docker

```bash
docker build -t nodejs-rest-api:prod .
docker run -d -p 3001:3001 --restart unless-stopped --name api-prod nodejs-rest-api:prod
```

### Option 2: Docker Compose

```bash
docker-compose -f docker-compose.production.yml up -d
```

### Option 3: Cloud Deployment

- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- Heroku
- DigitalOcean App Platform

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
docker-compose -f docker-compose.production.yml up -d
docker-compose -f docker-compose.production.yml logs -f api
docker-compose -f docker-compose.production.yml down
```

## 🔧 Troubleshooting

### Common Issues

1. **Port already in use**

   ```bash
   # Check what's using port 3001
   netstat -ano | findstr :3001  # Windows
   lsof -i :3001                 # Mac/Linux

   # Use different port
   PORT=3001 npm run dev
   ```

2. **Container won't start**

   ```bash
   # Check container logs
   docker logs nodejs-rest-api-prod

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

### Debug Mode

Add debug logging:

```javascript
// In server.js
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
```

## 📞 Support

If you encounter any issues:

1. Check the logs: `docker logs -f nodejs-rest-api-prod`
2. Verify all files are in place
3. Ensure Docker is running
4. Check port availability

## 📄 License

MIT License
