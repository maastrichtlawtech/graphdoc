# GraphDoc

GraphDoc is a web-application that has been developed on behalf of the [Maastricht Law & Tech Lab](https://github.com/maastrichtlawtech/), which is part of Maastricht University in The Netherlands.

The goal of this application is to aid users in visually constructing Docassemble interview configuration files.

## Usage         

### Docker

The recommended method for installing GraphDoc on a server is using Docker.

First clone the repositry and navigate with the command line to the destination folder.
```
git clone https://github.com/maastrichtlawtech/graphdoc
cd graphdoc
```

Next, build the container
```
docker build -t graphdoc ./
```

Then run the container on the desired port, which is `80` by default.

```
docker run graphdoc --name graphdoc -p 80:80
```

### Manual installation

To manually install GraphDoc, you are required to have atleast npm installed. It does not require a webserver, however this is recommended.

First clone the repositry and navigate with the command line to the destination folder.
```
git clone https://github.com/maastrichtlawtech/graphdoc
cd graphdoc
```

Next, install the npm dependencies and build the files using npm
```
npm install
npm run build
```

The built package is located at `./dist`. This folder can be served using any webserver, like [http-server](https://www.npmjs.com/package/http-server):
```
npx http-server dist
```

Alternatively, the index.html file in the dist folder (`dist/index.html`) can be opened using a webbrowser from the file explorer.
