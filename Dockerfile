FROM alekzonder/puppeteer

WORKDIR /app

COPY package.json package.json

RUN yarn

COPY . .

CMD node app.js