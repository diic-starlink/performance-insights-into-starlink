FROM node:22-bookworm-slim

COPY . /app
WORKDIR /app

RUN cd /app && npm install

CMD ["npm", "run", "start"]
