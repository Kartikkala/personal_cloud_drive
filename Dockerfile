FROM node:16

RUN apt update

RUN apt upgrade -y

COPY . .

RUN npm ci

EXPOSE 80

RUN mkdir downloadables

VOLUME ["./downloadables", "./volume1"]

CMD ["node", "app.js"]