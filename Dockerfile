FROM node:6.9.5

RUN mkdir -p /home/Service

WORKDIR /home/Service 

COPY ./package.json /home/Service
RUN npm install -g cnpm --registry=https://registry.npm.taobao.org
RUN cnpm install
RUN cnpm i -g pm2 --save
RUN pm2 link qzi785bx94nsysk m5ds5q2bd7pxghe
COPY . /home/Service

EXPOSE 2017

CMD [ "pm2","start","server.js"]
# -d 表明容器会在后台运行，-p 表示端口映射，把本机的2017商品映射到container的80端口这样外网就能通过本机的2017访问我们的web了。