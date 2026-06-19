# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first (for caching)
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build argument for the API URL, defaults to "/api/" for same-domain deployment
ARG VITE_API_URL=/api/
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Production stage
FROM nginx:1.25-alpine

# Copy build artifacts to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
