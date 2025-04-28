FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm cache clean --force && npm install --verbose

COPY . .

EXPOSE 5000

CMD ["node", "index.js"]
