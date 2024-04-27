FROM node:20.11.1

WORKDIR /
 
COPY . .

RUN cd ./react-app \
    && npm install \
    && npm run build \
    && cd ../web-server \
    && npm install

EXPOSE 9000

CMD [ "node", "server.js" ]