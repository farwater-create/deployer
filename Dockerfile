FROM node:18-alpine3.16 as BUILD
WORKDIR /app
COPY prisma prisma/
COPY src src/
COPY yarn.lock .
COPY package.json .
COPY tsconfig.json .
RUN yarn install
RUN yarn prisma generate
RUN yarn build

FROM node:18-alpine3.16
WORKDIR /app
COPY --from=BUILD /app/node_modules node_modules/
COPY --from=BUILD /app/build build/
COPY package.json .
ENV DATABASE_URL=file:/opt/deployer/userdata.db
CMD [ "yarn", "run", "production" ]
