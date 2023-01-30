FROM node:19-alpine

COPY src configs /opt/app/

WORKDIR /opt/app/

RUN npm install

ENTRYPOINT ["node", "app.js"]
