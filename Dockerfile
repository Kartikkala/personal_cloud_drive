FROM archlinux

RUN pacman -Syu aria2 nvm zsh python base-devel gpac --noconfirm

RUN mkdir /home/sirkartik && mkdir /home/sirkartik/Downloads && mkdir /home/sirkartik/Downloads/cloud

SHELL ["/bin/zsh", "-c"]

RUN source /usr/share/nvm/init-nvm.sh && nvm install 21

ARG MONGO_CONNECTION_STRING

ARG USER_EMAIL_ADDRESS

ARG USER_EMAIL_PASSWORD

ENV MONGO_CONNECTION_STRING=${MONGO_CONNECTION_STRING}

ENV USER_EMAIL_ADDRESS=${USER_EMAIL_ADDRESS}

ENV USER_EMAIL_PASSWORD=${USER_EMAIL_PASSWORD}

COPY . /home

RUN chmod +x home/start.sh

RUN source /usr/share/nvm/init-nvm.sh && cd /home && nvm use 21 && npm ci

EXPOSE 5000

VOLUME ["/home/sirkartik/Downloads/cloud"]

CMD ["/home/start.sh"]