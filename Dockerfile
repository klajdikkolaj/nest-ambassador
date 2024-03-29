FROM node:16.4

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
CMD npm run start:dev

