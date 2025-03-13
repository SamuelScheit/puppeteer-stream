FROM zenika/alpine-chrome:with-puppeteer

COPY . .

CMD ["node", "examples/file.js"]
