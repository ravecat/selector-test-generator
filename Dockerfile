FROM node:10.13-alpine
WORKDIR /app
COPY . .
RUN yarn install && \
    yarn cache clean && \
    yarn test:generate
CMD ["./node_modules/.bin/jest", "--passWithNoTests"]
