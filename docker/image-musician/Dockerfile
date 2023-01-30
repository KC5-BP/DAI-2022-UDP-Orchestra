FROM node:19-alpine

COPY src concert-protocol.js /opt/app/

WORKDIR /opt/app/

RUN npm install
RUN npm install uuid

ENTRYPOINT ["node", "app.js"]
