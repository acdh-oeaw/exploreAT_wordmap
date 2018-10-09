# RDF Explorer
This is the code repository of RDF-Explorer, a visualization tool of RDF-based lexicography ontologies which is part of the [ExploreAT!](http://www.oeaw.ac.at/acdh/de/exploreAT) project, a collaboration between the [Austrian Center for Digital Humanities](http://www.oeaw.ac.at) and [VisUsal](http://visusal.usal.es/), the Visual Analytics and Information Visualization from University of Salamanca. 

## Setup
If you already have [node](https://nodejs.org/en/) and [yarn](https://yarnpkg.com) installed in your machine, you can simply run the commands listed in the steps below. The page is built with [webpack](https://webpack.js.org/), for which there are two different environment-dependent configurations, development and production.

### 1. Install dependencies
```
$ yarn install
```

### 2. Development
In order to make any changes to the code you'll have to run the following command. It uses webpack-dev-server and enables hot reloading for easing up the work. 
```
$ yarn dev
```

## Build
When you are done developing you can generate production-ready static files with:
```
$ yarn run build
```
Compiled files will be put under the /dist folder. Copy these files to the www root folder on your server and you'll have deployed the page. 

