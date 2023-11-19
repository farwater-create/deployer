FROM oven/bun:alpine
RUN apk add --no-cache nodejs npm
WORKDIR /app
COPY prisma .
COPY src src/
COPY bun.lockb .
COPY package-lock.json .
COPY package.json .
COPY tsconfig.json .
RUN bun install
RUN npx prisma generate
RUN apk del nodejs npm
CMD ["bun", "start"]