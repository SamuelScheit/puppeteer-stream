docker build -t puppeteer-stream .
docker run -v ./examples/:/usr/src/app/examples puppeteer-stream
