FROM node:16

RUN apt update

RUN apt upgrade -y

COPY . .

RUN chmod +x start.sh

RUN apt install aria2 sudo -y

RUN npm ci

EXPOSE 80

VOLUME ["./downloadables"]

CMD ["./start.sh"]