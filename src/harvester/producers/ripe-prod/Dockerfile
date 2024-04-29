FROM node:20-bullseye-slim

COPY . /app
WORKDIR /app

RUN cd /app && npm install

CMD ["npm", "run", "harvester"]
