FROM node:7.2.0

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

#COPY app /usr/src/app

EXPOSE 8888