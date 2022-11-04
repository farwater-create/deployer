FROM node:18-alpine3.16 as BUILD
WORKDIR /app
COPY src src/
COPY yarn.lock .
COPY package.json .
COPY tsconfig.json .
RUN yarn install
RUN yarn build

FROM node:18-alpine3.16
WORKDIR /app
COPY --from=BUILD /app/build build/
COPY package.json .
RUN yarn install
CMD [ "yarn", "run", "production" ]
