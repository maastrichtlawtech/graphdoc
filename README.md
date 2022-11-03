# GraphDoc

## Introduction

GraphDoc is a web-application that has been developed by [Sander van Essel](https://github.com/eensander) as part of an internship for the [Maastricht Law & Tech Lab](https://github.com/maastrichtlawtech/), which is part of Maastricht University, The Netherlands.

The goal of this application is to aid users in visually constructing [Docassemble](https://github.com/jhpyle/docassemble/) interview configuration files.

## Demo
The demo is available at [https://maastrichtlawtech.github.io/graphdoc/](https://maastrichtlawtech.github.io/graphdoc/).

### Example

User Interface | Docassemble
-- | --
![ui](https://user-images.githubusercontent.com/50321538/174894290-6d5a6e41-4966-406d-9537-3bdf127eb63b.png) | ![docassemble output](https://user-images.githubusercontent.com/50321538/173640275-d485c7cb-06a4-4eae-93a6-0aa080d208a5.png)

The interview constructed in the above screenshot results in the following generated Docassemble interview configuration file:
```yaml
question: Start
subquestion: |
  walk or bus?
continue button field: walk_or_bus
---
question: Question
subquestion: |
  is it raining?
field: is_raining
buttons:
  - "No"
  - "Yes"
---
question: Notice
subquestion: |
  take an umbrella
continue button field: notice_take_umbrella
---
event: end_bus
question: End
subquestion: |
  take the bus
---
event: end_walk
question: End
subquestion: |
  take a walk
---
mandatory: True
code: |
  walk_or_bus
  if is_raining == 'Yes':
    notice_take_umbrella
    end_bus
  if is_raining == 'No':
    end_walk
```


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

## License
See the LICENSE file for license rights and limitations (Apache 2.0).
