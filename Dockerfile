FROM node:alpine

WORKDIR /app

COPY  parckage.json .

RUN npm install

COPY . .

EXPOSE 4000

CMD ["node" ,"app.js"]