FROM node:16

RUN apt update

RUN apt upgrade -y

COPY . .

RUN apt install aria2 -y

RUN aria2c --enable-rpc --rpc-listen-all=true --rpc-allow-origin-all --disable-ipv6 &

RUN npm ci

EXPOSE 80

RUN mkdir downloadables

VOLUME ["./downloadables", "./volume1"]

CMD ["node", "app.js"]