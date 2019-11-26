FROM node:12-slim

WORKDIR prace

COPY package.json package-lock.json tsconfig.json ./

RUN npm install --silent

COPY src/ ./src

RUN npm run build

RUN npm run test:unit

ENTRYPOINT ["node", "./dist/index.js"]
