FROM node:alpine
RUN mkdir -p /code
WORKDIR /code
COPY package.json .
COPY yarn.lock .
RUN yarn install --silent

# Bundle app source
COPY . .
RUN yarn run build

EXPOSE 443
CMD node dist/main.js