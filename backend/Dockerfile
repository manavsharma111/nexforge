FROM node:22-slim

# Install git — required for cloning user repositories during deployment
RUN apt-get update && \
    apt-get install -y git --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy rest of backend source
COPY . .

EXPOSE 8000

CMD ["npm", "start"]
