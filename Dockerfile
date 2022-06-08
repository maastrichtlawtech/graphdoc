# Usage:
# Build the image:          docker build -t graphdoc ./
# Run image in container:   docker run -p 8080:80 graphdoc

FROM node:lts-alpine

# install simple http server for serving static content
RUN npm install -g http-server

# make the 'app' folder the current working directory
WORKDIR /app

# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

# install project dependencies
RUN npm install

# build app for production with minification
RUN npm run build

# serve dist folder on port 8080
EXPOSE 80
CMD [ "http-server", "dist", "-p", "80" ]