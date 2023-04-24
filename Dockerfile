FROM ubuntu

RUN apt update

RUN apt upgrade -y

COPY . .

RUN apt install nodejs -y

RUN apt install npm -y

RUN npm i

EXPOSE 80

RUN mkdir downloadables

VOLUME ["./downloadables", "./volume1"]

CMD ["node", "app.js"]