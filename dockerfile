FROM node:16.8.0-alpine3.13

COPY . .

RUN npm install

RUN npm run puff