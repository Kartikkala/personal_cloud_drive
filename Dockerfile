FROM node:16

RUN apt update

RUN apt upgrade -y

ARG MONGO_CONNECTION_STRING

ENV MONGO_CONNECTION_STRING=${MONGO_CONNECTION_STRING}

COPY . .

RUN chmod +x start.sh

RUN apt install aria2 sudo -y

RUN npm ci

EXPOSE 5000

VOLUME ["./downloadables"]

CMD ["./start.sh"]