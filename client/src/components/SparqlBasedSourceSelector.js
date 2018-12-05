import React from "react";
import { BrowserRouter as Route, NavLink } from "react-router-dom";
import * as d3 from 'd3';
import { sparql } from 'd3-sparql';
import UrlParamWrapper from '../aux/UrlParamWrapper';
import SparqlQueryBuilder from '../aux/SparqlQueryBuilder.js';

/**
 * Explorer
 * Component for the initial exploration screen. Ontology url and prefix, 
 * and the SPARQL database endpoints are obtained here.
 *
 * @param props
 * @return {React.Component} 
 */
class SparqlBasedSourceSelector extends React.Component{
    constructor(props){
        super(props);
        this.state={
            prefix:"oldcan",
            sparql:"http://localhost:3030/oldcan/query",
            ontology:"https://explorations4u.acdh.oeaw.ac.at/ontology/oldcan",
            current_state: "",
            loading: false
        };

        this.sparqlQueries = new SparqlQueryBuilder();
        this.wrapper = new UrlParamWrapper();
        this.handleOntologyUrlChange = this.handleOntologyUrlChange.bind(this);
        this.handlePrefixChange = this.handlePrefixChange.bind(this);
        this.handleSparqlChange = this.handleSparqlChange.bind(this);
        this.loadData = this.loadData.bind(this);

    }

    loadData(){
        this.setState({ loading: true, current_state:'Retrieving entities'});
        new Promise((resolve,reject)=>{
            sparql(this.state.sparql, this.sparqlQueries.getAvailableEntities(this.state.ontology, this.state.prefix), (err, data) => {
                if (data && !err) {
                    this.setState({ current_state:'Retrieving relationships'});
                    resolve(data)
              } else if (err) throw err
            });
        }).then((entities)=>{
            sparql(this.state.sparql, this.sparqlQueries.getEntityRelationships(this.state.ontology, this.sparqlprefix), (err, data) => {
                if (data && !err) {
                    const curatedEntities = entities.map(e=>({
                        name : (e.entity.includes(this.state.ontology+'#')===false?e.entity:(this.state.prefix+':'+e.entity.split(this.state.ontology+'#')[1])),
                        count : +e.count
                    }));
                    const curatedRelationships = data.map(e=>({
                        source: (e.entity.includes(this.state.ontology+'#')===false?e.entity:(this.state.prefix+':'+e.entity.split(this.state.ontology+'#')[1])),
                        relationship: (e.relationship.includes(this.state.ontology+'#')===false?e.relationship:(this.state.prefix+':'+e.relationship.split(this.state.ontology+'#')[1])),
                        target: (e.to.includes(this.state.ontology+'#')===false?e.to:(this.state.prefix+':'+e.to.split(this.state.ontology+'#')[1])),
                        value: 6.5,
                    }));
                    const ontology = {
                        prefixes:[{prefix:this.state.prefix, uri:this.state.ontology}],
                        entities:curatedEntities,
                        relationships:curatedRelationships,
                        ontology_base:this.state.ontology,
                        ontology_prefix:this.state.prefix,
                    }
                    this.props.setSources(ontology, this.state.sparql);
              } else if (err) throw err
            });
        });
    }

	handleOntologyUrlChange(event){
		this.setState({ontology: event.target.value})
	};

	handleSparqlChange(event){
		this.setState({sparql: event.target.value});
	};

	handlePrefixChange(event){
		this.setState({prefix: event.target.value});
	};

	render() {
	    return (
	    	<div id="source_selector">
		      	<form style={({display: this.state.loading===false?'initial':'none'})}>
                    <label>
                      Url to ontology :<br/>
                      <input type="text" value={this.state.ontology} onChange={this.handleOntologyUrlChange} />
                    </label>
			        <label>
			          Prefix for the ontology:
			          <input type="text" value={this.state.prefix} onChange={this.handlePrefixChange} />
			        </label>
			        <label>
			          Sparql endpoint:
			          <input type="text" value={this.state.sparql} onChange={this.handleSparqlChange} />
			        </label>
		      	</form>
                <a onClick={()=>this.loadData()} style={
                    (this.state.ontology.length>0 && 
                        this.state.sparql.length>0 && 
                        this.state.prefix.length>0 && 
                        this.state.loading===false)?{display:"block"}:{display:"none"}
                }>Load</a>
                <div id="loader" style={({display: this.state.loading===false?'none':'flex'})}>
                    <div className="loader" ></div>
                    <p>{this.state.current_state}</p>
                </div>
	      	</div>
	    );
	}
}	

export default SparqlBasedSourceSelector;
