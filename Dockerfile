# Use official lightweight Node image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy dependency files first (better caching)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy application source
COPY . .

# Expose app port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
