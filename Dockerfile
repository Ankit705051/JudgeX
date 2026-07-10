FROM node:20-slim

# Install system dependencies: C++ compiler, Python, Java, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    g++ \
    gcc \
    python3 \
    python3-pip \
    openjdk-17-jdk \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

# Set Java environment variables
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH="${JAVA_HOME}/bin:${PATH}"

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

EXPOSE 3000

# Command to run the app (will be overridden for worker)
CMD ["node", "index.js"]
