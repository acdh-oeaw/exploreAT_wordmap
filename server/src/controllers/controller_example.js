const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const wrapper = require('../aux/UrlParamWrapper'); 

// Retrieves an external resource to evade cross origin restrictions
router.route('/resource/:url')
    .get(function(req, res){
    	fetch(wrapper.paramToUrl(req.params.url), {redirect:'no-redirect'})
		    .then(a => a.text())
		    .then(a=>{
		    	res.type('text/xml')
		    	res.send(a);
		    }).catch(error=>console.error(error));        
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
