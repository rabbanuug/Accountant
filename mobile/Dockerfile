# Base image for React Native / Expo
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install system dependencies required for Expo and native builds
RUN apk add --no-cache \
  git \
  bash \
  curl \
  libc6-compat


# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose ports needed by Expo
# 8081: Metro Bundler
EXPOSE 8081

# Start the Expo application
CMD ["npm", "start"]
