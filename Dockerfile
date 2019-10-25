FROM node:10.13-alpine as builder
WORKDIR /app
COPY . .
RUN yarn install && \
    yarn build

FROM alpine:latest
WORKDIR /app
COPY package.json jest.config.js .babelrc ./
COPY ./app ./app
COPY --from=builder /app/dist ./dist
RUN apk add yarn && \
    yarn global add jest && \
    # Imitate production environment
    yarn install --production && \
    yarn add reselect babel-jest
RUN node /app/dist/index.js ./app -s ./app/state.js
CMD ["jest", "--passWithNoTests"]
