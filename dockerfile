FROM node:alpine

COPY . .

RUN npm install

RUN npm run puff