const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const wrapper = require('../aux/UrlParamWrapper'); 

router.route('/resource/:url')
    .get(function(req, res){
    	fetch(wrapper.paramToUrl(req.params.url))
		    .then(a => a.text())
		    .then(a=>{
		    	res.type('text/xml')
		    	res.send(a);
		    }).catch(error=>console.error(error));        
    });

router.route('/param1/:param1/param2/:param2')
    .get(function(req, res){
        res.json({
            received: true,
            parameter_1: req.params.param1,
            parameter_2: req.params.param2,            
        });
    });

module.exports = router
