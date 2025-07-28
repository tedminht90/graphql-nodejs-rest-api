# Sử dụng Node.js official image
FROM node:alpine

# Đặt thông tin maintainer
LABEL maintainer="your-email@example.com"
LABEL description="Node.js REST API Backend"

# Tạo directory cho app
WORKDIR /usr/src/app

# Copy package.json và package-lock.json trước để tối ưu Docker cache
COPY package*.json ./

# Cài đặt dependencies
RUN npm ci --only=production && npm cache clean --force

# Tạo user non-root để chạy app (security best practice)
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy source code
COPY --chown=nodejs:nodejs . .

# Chuyển sang user nodejs
USER nodejs

# Expose port
EXPOSE 3000

# Health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD node healthcheck.js

# Chạy ứng dụng
CMD ["npm", "start"]