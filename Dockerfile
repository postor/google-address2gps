FROM alekzonder/puppeteer

WORKDIR /app

COPY package.json package.json

RUN yarn

COPY . .

ENV NO_SANDBOX=1

CMD node app.js