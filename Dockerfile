FROM node:18-alpine
ARG DOCKER_USER=default_user
RUN addgroup -S $DOCKER_USER && adduser -S $DOCKER_USER -G $DOCKER_USER
RUN mkdir /app
WORKDIR /app
COPY tsconfig.json .
COPY prisma .
COPY src src/
COPY package-lock.json .
COPY package.json .
COPY tsconfig.json .
RUN npm install
RUN npx prisma generate
RUN chown -R ${DOCKER_USER}:${DOCKER_USER} /app
CMD [ "npm", "start" ]
