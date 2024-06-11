FROM node:20

WORKDIR /app

COPY package*.json ./

RUN 

COPY . .

EXPOSE 4000

CMD ["node" ,"server.js"]