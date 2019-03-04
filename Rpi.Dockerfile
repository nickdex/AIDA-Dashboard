FROM arm32v7/node

COPY qemu-arm-static /usr/bin/qemu-arm-static

WORKDIR /app

RUN yarn global add http-server

# Copy cache contents (if any) from local machine
# postcss config is needed at same level as node_modules for vue-cli to work
ADD .yarn-cache.tgz package.json yarn.lock /

# Install packages
# Container Specific node packages at root (for remote debug)
RUN cd / && yarn && ln -s /node_modules /app/node_modules

ADD . /app

COPY postcss.config.js /

RUN yarn build

EXPOSE 80

CMD [ "http-server", "-p", "80", "-P", "http://server", "dist" ]
