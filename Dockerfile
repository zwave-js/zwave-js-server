FROM node:erbium-buster AS build
ENV LANG C.UTF-8

# Copy data for add-on
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN npm install
RUN npm run build
RUN npm prune --production

FROM node:erbium-buster-slim
COPY --from=build /usr/src/app /usr/src/app
WORKDIR /usr/src/app
EXPOSE 3000
USER root
CMD [ "node", "dist/bin/server.js", "/dev/ttyUSB0" ]
