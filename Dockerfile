FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Build the Vite React frontend
RUN npm run build

# Expose the port Hugging Face Spaces expects
EXPOSE 7860

# Set environment variable for the port
ENV PORT=7860

# Start the Express server
CMD ["npm", "start"]
