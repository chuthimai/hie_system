# 1. Base image
FROM node:20

# disable ssl verification inside node
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
ENV CURL_SSL_NO_VERIFY=1

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
EXPOSE 3333

# 8. Lệnh khởi chạy
CMD sh -c "npm run start"
