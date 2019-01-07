const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const wrapper = require('../aux/UrlParamWrapper'); 
const sparqlQueries = require('../aux/SparqlQueryBuilder');
const sparql = require('d3-sparql');

// Retrieves an external resource to evade cross origin restrictions
router.route('/resource/:url')
    .get(function(req, res){
    	fetch(wrapper.paramToUrl(req.params.url))
		    .then(a => a.text())
		    .then(a=>{
		    	res.type('text/xml')
		    	res.send(a);
		    }).catch(error=>console.error(error));        
    });

router.route('/entities/:url')
    .get(function(req, res){
        const url = wrapper.paramToUrl(req.params.url)
        console.log(url)
        sparql.sparql(url, sparqlQueries.getAvailableEntities(), (err, data) => {
            console.log('aui')
            if (data && !err) {
                res.type('text')
                console.log(data)
                res.send(JSON.stringify(data))
          } else if (err) throw err
        });         
    });

router.route('/relationships/:url')
    .get(function(req, res){
        const url = wrapper.paramToUrl(req.params.url)
        console.log(url)
        sparql.sparql(url, sparqlQueries.getEntityRelationships(), (err, data) => {
            console.log('aui')
            if (data && !err) {
                res.type('text')
                console.log(data)
                res.send(JSON.stringify(data))
          } else if (err) throw err
        });         
    });

// Dummy route for scaffolding
router.route('/param1/:param1/param2/:param2')
    .get(function(req, res){
        res.json({
            received: true,
            parameter_1: req.params.param1,
            parameter_2: req.params.param2,            
        });
    });

module.exports = router