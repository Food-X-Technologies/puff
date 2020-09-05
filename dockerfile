FROM node:alpine

COPY . .

RUN npm install

RUN npm run render

RUN npm run puff