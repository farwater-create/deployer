FROM node:18-alpine3.16 as BUILD
WORKDIR /app
COPY prisma prisma/
COPY src src/
COPY package-lock.json .
COPY package.json .
COPY tsconfig.json .
RUN npm install
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine3.16
USER node
WORKDIR /app
COPY --from=BUILD --chown=node:node /app/node_modules node_modules/
COPY --from=BUILD -chown=node:node /app/build build/
COPY package.json .
CMD [ "node", "/app/build/index.js" ]
