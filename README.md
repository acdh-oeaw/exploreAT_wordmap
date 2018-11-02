# RDF Explorer
This is the code repository of RDF-Explorer, a web platform containing visualization tools of RDF-based lexicography ontologies which is part of the
[ExploreAT!](http://www.oeaw.ac.at/acdh/de/exploreAT) project, a collaboration between the [Austrian Center for Digital Humanities](http://www.oeaw.ac.at) 
and [VisUsal](http://visusal.usal.es/), the Visual Analytics and Information Visualization from University of Salamanca. 


## Setup
Project development is based on [docker-compose]( https://docs.docker.com/compose ). 
It is the only requirement to develop and serve the platform. 

With it, two different conatiners are created: one for the client and one for the server; each of them with their separate dependencies.

This helps managing one's machine, avoiding having to install globally depencies for each project or having conflicting
installations of the same software.

### 2. Development
Once you have [docker-compose]( https://docs.docker.com/compose ) installed, it is only needed to run the following
command to have both client and server up and running:
```
$ docker-compose up
```
Client site is available at __port 3000__ and the server at __port 8080__. Both of them will refresh based on changes to
the code to show them and therefore easing up the work. For it, uses webpack-dev-server and nodemon.

## Build
