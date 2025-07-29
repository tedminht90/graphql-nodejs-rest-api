# Node.js REST API

Simple REST API backend built with Node.js, Express.js using MVC architecture pattern.

## 📋 Features

- CRUD operations for User management
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
  "timestamp": "2025-07-28T02:00:00.000Z"
}
```

## 🔒 Security Testing with OWASP ZAP

### Overview

This API includes comprehensive security testing using OWASP ZAP (Zed Attack Proxy) for Dynamic Application Security Testing (DAST). ZAP automatically tests for common security vulnerabilities like SQL injection, XSS, authentication bypass, and more.

### Prerequisites for ZAP Testing

- Docker installed and running
- API server running on `0.0.0.0:3001` (not localhost)
- OpenAPI specification available at `/api-docs.json`

### Configure API for ZAP Testing

**Important**: For ZAP to access your API from Docker, the server must bind to `0.0.0.0` instead of `localhost`:

```javascript
// In src/server.js
app.listen(3001, "0.0.0.0", () => {
  console.log(`🚀 Server is running on port 3001`);
  console.log(`📍 Health check: http://0.0.0.0:3001}/health`);
  console.log(`📍 API Documentation: http://0.0.0.0:3001/api-docs`);
  console.log(`📍 OpenAPI Spec: http://0.0.0.0:3001/api-docs.json`);
  console.log(`📍 API endpoints: http://0.0.0.0:3001/api/users`);
});
```

### ZAP Security Testing Commands

#### 1. Basic API Security Scan

```bash
# Windows PowerShell
docker run -v ${PWD}:/zap/wrk/:rw -t zaproxy/zap-stable zap-api-scan.py -t http://host.docker.internal:3001/api-docs.json -f openapi -J zap-report.json -r zap-report.html

# Linux/macOS
docker run -v $(pwd):/zap/wrk/:rw -t zaproxy/zap-stable zap-api-scan.py -t http://host.docker.internal:3001/api-docs.json -f openapi -J zap-report.json -r zap-report.html
```

#### 2. Comprehensive Security Scan (with Alpha Rules)

```bash
# More thorough testing with experimental rules
docker run -v ${PWD}:/zap/wrk/:rw -t zaproxy/zap-stable zap-api-scan.py -t http://host.docker.internal:3001/api-docs.json -f openapi -a -J zap-report.json -r zap-report.html -w zap-report.md
```

#### 3. Safe Mode Scan (Passive Only)

```bash
# Only passive scanning - safe for production
docker run -v ${PWD}:/zap/wrk/:rw -t zaproxy/zap-stable zap-api-scan.py -t http://host.docker.internal:3001/api-docs.json -f openapi -S -J zap-report.json -r zap-report.html
```

#### 4. Baseline Security Scan

```bash
# Quick baseline security assessment
docker run -v ${PWD}:/zap/wrk/:rw -t zaproxy/zap-stable zap-baseline.py -t http://host.docker.internal:3001 -J zap-baseline.json -r zap-baseline.html
```

#### 5. Full Security Scan (Most Comprehensive)

```bash
# Full active + passive scanning (use with caution)
docker run -v ${PWD}:/zap/wrk/:rw -t zaproxy/zap-stable zap-full-scan.py -t http://host.docker.internal:3001 -J zap-full.json -r zap-full.html
```

### ZAP Security Test Types

ZAP will automatically test for these security vulnerabilities:

#### **Injection Attacks**

- SQL Injection
- NoSQL Injection
- Command Injection
- LDAP Injection
- XPath Injection

#### **Cross-Site Scripting (XSS)**

- Reflected XSS
- Stored XSS
- DOM-based XSS

#### **Authentication & Authorization**

- Authentication bypass
- Session management flaws
- Privilege escalation
- JWT vulnerabilities

#### **Input Validation**

- Path traversal
- File inclusion attacks
- Buffer overflow
- Format string attacks

#### **Configuration Issues**

- Missing security headers
- CORS misconfigurations
- HTTP methods allowed
- Directory listing

#### **Information Disclosure**

- Sensitive data exposure
- Error message information leakage
- Server information disclosure

### ZAP Report Analysis

After running ZAP scans, you'll get multiple report formats:

#### **HTML Report** (`zap-report.html`)

```bash
# Open in browser (Windows)
start zap-report.html

# Open in browser (macOS)
open zap-report.html

# Open in browser (Linux)
xdg-open zap-report.html
```

#### **JSON Report** (`zap-report.json`)

```bash
# View JSON report summary
cat zap-report.json | jq '.site[].alerts[] | {risk, confidence, name, count}'
```

#### **Markdown Report** (`zap-report.md`)

```bash
# View markdown report
cat zap-report.md
```

### ZAP Security Testing Workflow

#### **1. Pre-Test Setup**

```bash
# Start API server for testing
npm run dev

# Verify OpenAPI spec is accessible
curl http://localhost:3001/api-docs.json

# Check all endpoints are working
curl http://localhost:3001/health
curl http://localhost:3001/api/users
```

#### **2. Run Security Tests**

```bash
# Create reports directory
mkdir -p security-reports

# Run comprehensive security scan
docker run -v ${PWD}/security-reports:/zap/wrk/:rw -t zaproxy/zap-stable zap-api-scan.py \
  -t http://host.docker.internal:3001/api-docs.json \
  -f openapi \
  -a \
  -J comprehensive-security-report.json \
  -r comprehensive-security-report.html \
  -w comprehensive-security-report.md \
  -x comprehensive-security-report.xml
```

#### **3. Review Security Results**

```bash
# List generated reports
ls security-reports/

# View high-level summary
echo "Security scan completed. Check reports:"
echo "- HTML: security-reports/comprehensive-security-report.html"
echo "- JSON: security-reports/comprehensive-security-report.json"
echo "- Markdown: security-reports/comprehensive-security-report.md"
```

### ZAP Configuration Files

#### **Custom ZAP Configuration** (`zap-config.yaml`)

Create advanced ZAP configurations for specific testing scenarios:

```yaml
env:
  contexts:
    - name: "API Security Context"
      urls:
        - "http://host.docker.internal:3001.*"
      includePaths:
        - "http://host.docker.internal:3001/api/.*"
      excludePaths:
        - "http://host.docker.internal:3001/health"
        - "http://host.docker.internal:3001/api-docs"

jobs:
  - type: openapi
    parameters:
      apiFile: "http://host.docker.internal:3001/api-docs.json"
      apiUrl: "http://host.docker.internal:3001"

  - type: activeScan
    parameters:
      context: "API Security Context"

  - type: report
    parameters:
      template: "traditional-html"
      reportFile: "detailed-security-report.html"
```

Run with custom config:

```bash
docker run -v ${PWD}:/zap/wrk/:rw -t zaproxy/zap-stable zap-automation.py -cmd -configfile /zap/wrk/zap-config.yaml
```

### Security Testing Scripts

#### **Windows PowerShell Script** (`security-test.ps1`)

```powershell
#!/usr/bin/env pwsh

Write-Host "🔒 Starting OWASP ZAP Security Testing..." -ForegroundColor Green

# Create reports directory
if (!(Test-Path "security-reports")) {
    New-Item -ItemType Directory -Path "security-reports"
}

$API_URL = "http://host.docker.internal:3001"
$TIMESTAMP = Get-Date -Format "yyyyMMdd-HHmmss"

Write-Host "📋 Running API Security Scan..." -ForegroundColor Yellow
docker run -v ${PWD}/security-reports:/zap/wrk/:rw -t zaproxy/zap-stable zap-api-scan.py `
  -t "$API_URL/api-docs.json" `
  -f openapi `
  -a `
  -J "api-security-$TIMESTAMP.json" `
  -r "api-security-$TIMESTAMP.html" `
  -w "api-security-$TIMESTAMP.md"

Write-Host "📋 Running Baseline Security Scan..." -ForegroundColor Yellow
docker run -v ${PWD}/security-reports:/zap/wrk/:rw -t zaproxy/zap-stable zap-baseline.py `
  -t $API_URL `
  -J "baseline-security-$TIMESTAMP.json" `
  -r "baseline-security-$TIMESTAMP.html"

Write-Host "✅ Security testing completed!" -ForegroundColor Green
Write-Host "📊 Reports available in: security-reports/" -ForegroundColor Cyan
Write-Host "🌐 Open HTML reports in browser to view detailed results" -ForegroundColor Cyan
```

#### **Linux/macOS Script** (`security-test.sh`)

```bash
#!/bin/bash

echo "🔒 Starting OWASP ZAP Security Testing..."

# Create reports directory
mkdir -p security-reports

API_URL="http://host.docker.internal:3001"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")

echo "📋 Running API Security Scan..."
docker run -v $(pwd)/security-reports:/zap/wrk/:rw -t zaproxy/zap-stable zap-api-scan.py \
  -t "$API_URL/api-docs.json" \
  -f openapi \
  -a \
  -J "api-security-$TIMESTAMP.json" \
  -r "api-security-$TIMESTAMP.html" \
  -w "api-security-$TIMESTAMP.md"

echo "📋 Running Baseline Security Scan..."
docker run -v $(pwd)/security-reports:/zap/wrk/:rw -t zaproxy/zap-stable zap-baseline.py \
  -t "$API_URL" \
  -J "baseline-security-$TIMESTAMP.json" \
  -r "baseline-security-$TIMESTAMP.html"

echo "✅ Security testing completed!"
echo "📊 Reports available in: security-reports/"
echo "🌐 Open HTML reports in browser to view detailed results"
```

Make executable:

```bash
chmod +x security-test.sh
./security-test.sh
```

### ZAP Integration with CI/CD

#### **GitHub Actions** (`.github/workflows/security-test.yml`)

```yaml
name: Security Testing with ZAP

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  security-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm install

      - name: Start API server
        run: |
          npm start &
          sleep 10

      - name: Verify API is running
        run: curl -f http://localhost:3001/health

      - name: Run ZAP API Scan
        run: |
          docker run -v ${{ github.workspace }}:/zap/wrk/:rw -t zaproxy/zap-stable \
            zap-api-scan.py \
            -t http://host.docker.internal:3001/api-docs.json \
            -f openapi \
            -S \
            -J zap-report.json \
            -r zap-report.html

      - name: Upload ZAP reports
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: zap-security-reports
          path: |
            zap-report.json
            zap-report.html
```

### Troubleshooting ZAP Issues

#### **Common Network Issues**

1. **Connection Refused Error**

   ```bash
   # Make sure API binds to 0.0.0.0
   # Check server.js: app.listen(3001, '0.0.0.0', ...)

   # Alternative: Use your machine's IP
   ipconfig  # Windows
   ifconfig  # Linux/macOS

   # Then use actual IP:
   docker run -v ${PWD}:/zap/wrk/:rw -t zaproxy/zap-stable zap-api-scan.py -t http://192.168.1.100:3001/api-docs.json -f openapi
   ```

2. **Docker Volume Mount Issues**

   ```bash
   # Use absolute path if relative path fails
   docker run -v "C:\full\path\to\project:/zap/wrk/:rw" -t zaproxy/zap-stable zap-api-scan.py ...
   ```

3. **OpenAPI Spec Not Found**

   ```bash
   # Verify OpenAPI endpoint
   curl http://localhost:3001/api-docs.json

   # Download and use local file if needed
   curl http://localhost:3001/api-docs.json > openapi.json
   docker run -v ${PWD}:/zap/wrk/:rw -t zaproxy/zap-stable zap-api-scan.py -t /zap/wrk/openapi.json -f openapi
   ```

#### **ZAP Command Reference**

```bash
# Quick reference for ZAP commands

# API Scan (recommended for APIs)
zap-api-scan.py -t <openapi-url> -f openapi [options]

# Baseline Scan (quick security check)
zap-baseline.py -t <target-url> [options]

# Full Scan (comprehensive but slower)
zap-full-scan.py -t <target-url> [options]

# Common options:
# -S          Safe mode (passive scan only)
# -a          Include alpha rules
# -d          Debug mode
# -J file     JSON report
# -r file     HTML report
# -w file     Markdown report
# -x file     XML report
```

### Security Best Practices

After running ZAP scans, address common findings:

#### **Missing Security Headers**

```javascript
// Add to Express.js app
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  next();
});
```

#### **Input Validation**

```javascript
// Enhanced validation in controllers
const validator = require("validator");

const validateUser = (data) => {
  const errors = [];

  if (!data.name || !validator.isLength(data.name, { min: 2, max: 100 })) {
    errors.push("Tên phải từ 2-100 ký tự");
  }

  if (!data.email || !validator.isEmail(data.email)) {
    errors.push("Email không hợp lệ");
  }

  // Sanitize input
  data.name = validator.escape(data.name);

  return { isValid: errors.length === 0, errors, data };
};
```

#### **Rate Limiting**

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP",
});

app.use("/api/", limiter);
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

#### Get user by Email

```bash
curl http://localhost:3001/api/users/email/nguyenvana@email.com
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
├── security-reports/          # ZAP security test reports
├── security-test.ps1          # Windows security testing script
├── security-test.sh           # Linux/macOS security testing script
├── zap-config.yaml           # ZAP configuration file
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Docker Compose setup
├── .dockerignore             # Docker ignore rules
├── healthcheck.js            # Health check script
├── package.json              # Dependencies
└── README.md                 # Documentation
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
curl http://localhost:3001/api/users/email/test@test.com

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

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Run security tests
./security-test.sh        # Linux/macOS
./security-test.ps1       # Windows

# Docker build
docker build -t nodejs-rest-api .

# Docker run
docker run -p 3001:3001 nodejs-rest-api

# Docker Compose
docker-compose up -d
docker-compose logs -f api
docker-compose down
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

4. **ZAP Connection Issues**

   ```bash
   # Ensure API binds to 0.0.0.0
   # Check server.js: app.listen(3001, '0.0.0.0', ...)

   # Verify OpenAPI spec accessibility
   curl http://localhost:3001/api-docs.json

   # Use actual IP if host.docker.internal fails
   ipconfig  # Get your machine's IP
   docker run ... -t http://192.168.1.100:3001/api-docs.json ...
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

## 📚 API Documentation

### Swagger/OpenAPI Documentation

The API includes comprehensive Swagger documentation available at:

- **Development**: http://localhost:3001/api-docs
- **Production**: https://your-domain.com/api-docs
- **OpenAPI Spec**: http://localhost:3001/api-docs.json

#### Features:

- **Interactive API testing**: Try endpoints directly from the documentation
- **Schema validation**: Complete request/response schemas
- **Vietnamese name sorting**: Detailed documentation of the intelligent sorting algorithm
- **Examples**: Multiple request examples for each endpoint
- **Error handling**: Comprehensive error response documentation
- **Security testing integration**: Direct ZAP integration with OpenAPI spec

#### Quick Access:

```bash
# Start server and open docs
npm run dev
npm run docs

# Access OpenAPI JSON for ZAP testing
curl http://localhost:3001/api-docs.json
```

## 🔐 Security Testing Checklist

Before deploying to production, ensure you've completed these security tests:

### ✅ **Pre-Deployment Security Checklist**

- [ ] **ZAP API Security Scan** - No high-risk vulnerabilities
- [ ] **ZAP Baseline Scan** - Passes security baseline
- [ ] **Input Validation** - All user inputs properly validated
- [ ] **Authentication Testing** - Auth mechanisms secure
- [ ] **Authorization Testing** - Proper access controls
- [ ] **Security Headers** - All security headers implemented
- [ ] **HTTPS Configuration** - SSL/TLS properly configured
- [ ] **Rate Limiting** - API rate limits implemented
- [ ] **Error Handling** - No sensitive info in error messages
- [ ] **CORS Configuration** - Proper CORS policies

### 🎯 **Security Test Reports**

After running ZAP scans, prioritize fixes based on risk levels:

#### **High Risk Issues** (Fix Immediately)

- SQL Injection vulnerabilities
- XSS vulnerabilities
- Authentication bypass
- Sensitive data exposure

#### **Medium Risk Issues** (Fix Before Production)

- Missing security headers
- CORS misconfigurations
- Information disclosure
- Weak encryption

#### **Low Risk Issues** (Monitor & Plan)

- Directory listing enabled
- Server version disclosure
- Missing security recommendations

#### **False Positives** (Document & Ignore)

- Expected behavior flagged as security issue
- Framework-specific behaviors
- Development-only endpoints

### 📈 **Continuous Security Monitoring**

#### **Regular Security Testing Schedule**

```bash
# Weekly security baseline scan
# Add to cron job or CI/CD pipeline
0 2 * * 1 docker run -v $(pwd)/security-reports:/zap/wrk/:rw -t zaproxy/zap-stable zap-baseline.py -t http://your-api-url -J weekly-baseline.json

# Monthly comprehensive scan
0 2 1 * * docker run -v $(pwd)/security-reports:/zap/wrk/:rw -t zaproxy/zap-stable zap-api-scan.py -t http://your-api-url/api-docs.json -f openapi -a -J monthly-comprehensive.json
```

#### **Security Metrics Tracking**

Track these metrics over time:

- Number of high/medium/low risk findings
- Time to fix security issues
- Security scan pass rate
- False positive rate

## 🚀 **Advanced ZAP Usage**

### **Custom ZAP Rules**

Create custom security rules for your specific API:

```python
# custom-zap-rules.py
def custom_api_validation_rule(msg):
    """Custom rule to check API-specific security patterns"""

    # Check for sensitive data in responses
    response_body = msg.getResponseBody().toString()

    if "password" in response_body.lower():
        return "Sensitive data (password) found in API response"

    if "secret" in response_body.lower():
        return "Sensitive data (secret) found in API response"

    return None

# Use with ZAP automation framework
```

### **ZAP with Authentication**

For APIs with authentication, configure ZAP to test authenticated endpoints:

```yaml
# zap-auth-config.yaml
env:
  contexts:
    - name: "Authenticated API Context"
      urls: ["http://host.docker.internal:3001.*"]
      authentication:
        method: "httpAuthentication"
        httpAuthentication:
          hostname: "host.docker.internal"
          port: 3001
          realm: ""

  users:
    - name: "test-user"
      credentials:
        username: "testuser@example.com"
        password: "testpassword"

jobs:
  - type: openapi
    parameters:
      apiFile: "http://host.docker.internal:3001/api-docs.json"
      context: "Authenticated API Context"
      user: "test-user"
```

### **ZAP Performance Testing Integration**

Combine security and performance testing:

```bash
# Run ZAP + performance tests
docker run -v ${PWD}:/zap/wrk/:rw -t zaproxy/zap-stable zap-api-scan.py \
  -t http://host.docker.internal:3001/api-docs.json \
  -f openapi \
  -T 30 \
  -J performance-security-report.json

# Performance metrics will be included in the security report
```

## 📞 Support

If you encounter any issues:

1. **API Issues**: Check the logs: `docker logs -f nodejs-rest-api-prod`
2. **Security Testing Issues**: Review ZAP reports in `security-reports/` directory
3. **Docker Issues**: Verify Docker is running and network connectivity
4. **Port Issues**: Check port availability and binding configuration

### **Getting Help**

- **ZAP Documentation**: https://www.zaproxy.org/docs/
- **OWASP API Security**: https://owasp.org/www-project-api-security/
- **Node.js Security**: https://nodejs.org/en/security/
- **Express.js Security**: https://expressjs.com/en/advanced/best-practice-security.html

## 📄 License

MIT License

---

## 🔒 **Security Contact**

For security vulnerabilities or concerns:

- Email: security@yourcompany.com
- Security Policy: See SECURITY.md
- Responsible Disclosure: 90-day disclosure timeline

---

**Remember**: Security testing should be an ongoing process, not a one-time activity. Run ZAP scans regularly and integrate them into your development workflow for the best protection.
