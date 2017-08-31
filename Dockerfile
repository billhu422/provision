FROM node:latest 
RUN apt-get update && apt-get -y install curl && apt-get -y install git  && apt-get -y install vim && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

WORKDIR /opt
RUN git clone https://github.com/billhu422/provision.git && \
        cd delivery2.0 && \
	git checkout -b hybrid && \
        npm install

RUN git clone https://github.com/billhu422/epilogue.git && \
        cd epilogue && \
        git checkout -b hybrid tags/v2.1&& \
        npm install

expose 3000

CMD  node /opt/epilogue/examples/server.js & node /opt/provision/bin/www
