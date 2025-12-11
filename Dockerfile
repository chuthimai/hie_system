# 1. Base image
FROM node:20

# 2. Tạo thư mục làm việc trong container
WORKDIR /app

# 3. Copy file package.json
COPY package*.json ./

# 4. Cài dependencies
RUN npm install

# 5. Copy toàn bộ source code
COPY . .

# 6. Build
RUN npm run build

# 7. Mở cổng
EXPOSE 3000

# 8. Lệnh khởi chạy
CMD sh -c "npm run typeorm:run-migration && npm run seed && npm run start"
