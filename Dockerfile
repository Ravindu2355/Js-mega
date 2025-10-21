FROM node:20-slim
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --only=production
COPY . .
ENV PORT=8000
EXPOSE 8000
CMD ["node", "index.js"]
