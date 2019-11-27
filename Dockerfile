FROM node:12-slim

WORKDIR prace

COPY package.json package-lock.json tsconfig.json ./

RUN npm install --silent

COPY src/ ./src

RUN npm run build

FROM node:12-slim

COPY --from=0 /prace/dist /prace/dist

ENTRYPOINT ["node", "/prace/dist/index.js"]
