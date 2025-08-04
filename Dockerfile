# STAGE 1: Builder - Sử dụng image Node.js đầy đủ để cài đặt dependencies
FROM node:lts AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Cài đặt tất cả dependencies, bao gồm cả devDependencies để build native addons
RUN npm ci

# Copy toàn bộ source code
COPY . .

# STAGE 2: Production - Sử dụng image Alpine siêu nhẹ cho image cuối cùng
FROM node:alpine

WORKDIR /usr/src/app

# Copy package.json để npm có thể chạy các script như "start"
COPY package*.json ./

# Chỉ copy thư mục node_modules đã được build hoàn chỉnh từ stage builder
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Chỉ copy source code của ứng dụng từ stage builder
COPY --from=builder /usr/src/app/src ./src

# Tạo user non-root để chạy app (security best practice)
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Chuyển sang user nodejs
USER nodejs

# Expose port mà ứng dụng đang lắng nghe (3001)
EXPOSE 3001

# Chạy ứng dụng
CMD ["npm", "start"]
