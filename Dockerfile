# Use Node.js 20 on Ubuntu for Railway
FROM node:20-bullseye

# Set working directory
WORKDIR /app

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Install LaTeX and required packages
RUN apt-get update && apt-get install -y \
    texlive-latex-base \
    texlive-latex-recommended \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    texlive-xetex \
    latexmk \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create pdfs directory for LaTeX compilation
RUN mkdir -p pdfs

# Build the Next.js application
RUN npm run build

# Expose port (Railway will set PORT env var)
EXPOSE $PORT

# Set environment to production
ENV NODE_ENV=production

# Start the application (Railway expects app to listen on $PORT)
CMD ["npm", "start"]