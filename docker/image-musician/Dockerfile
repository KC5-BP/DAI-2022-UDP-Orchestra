FROM node:19-alpine

#
# When we build the image, we copy the executable jar in the image file system.
#
#COPY src /opt/app/
COPY src concert-protocol.js /opt/app/

WORKDIR /opt/app/
RUN npm install
RUN npm install uuid

ENTRYPOINT ["node", "/opt/app/app.js"]
