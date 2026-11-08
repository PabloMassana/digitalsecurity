FROM node:22-alpine

WORKDIR /app


COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src

# Sin privilegios de root (heardening)
USER node

EXPOSE 5000


CMD ["node", "src/server.js"]