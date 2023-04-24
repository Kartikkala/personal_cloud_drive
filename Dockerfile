FROM ubuntu

RUN apt update

RUN apt upgrade -y

COPY . .

RUN ls

RUN apt install nodejs -y

EXPOSE 80

RUN mkdir downloadables

VOLUME ["./downloadables", "./volume"]

CMD ["node", "app.js"]