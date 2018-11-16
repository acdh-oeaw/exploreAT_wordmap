import React from "react";
import { BrowserRouter as Route, NavLink } from "react-router-dom";
import UrlParamWrapper from '../aux/UrlParamWrapper';

/**
 * Explorer
 * Component for the initial exploration screen. Ontology url and prefix, 
 * and the SPARQL database endpoints are obtained here.
 *
 * @param props
 * @return {React.Component} 
 */
class SourceSelector extends React.Component{
	constructor(props){
		super(props);
		this.state={
			ontology:"https://explorations4u.acdh.oeaw.ac.at/ontology/oldcan",
			prefix:"oldcan",
			sparql:"http://localhost:3030/oldcan/query"
		};

		this.wrapper = new UrlParamWrapper();
		this.handleOntologyChange = this.handleOntologyChange.bind(this);
		this.handlePrefixChange = this.handlePrefixChange.bind(this);
		this.handleSparqlChange = this.handleSparqlChange.bind(this);

	}

	handleOntologyChange(event){
		this.setState({ontology: event.target.value});
	};

	handleSparqlChange(event){
		this.setState({sparql: event.target.value});
	};

	handlePrefixChange(event){
		this.setState({prefix: event.target.value});
	};

	render() {
		const url = 
			"/explorer/ontology/"+
			this.wrapper.urlToParam(this.state.ontology)+
			"/prefix/"+
			this.wrapper.urlToParam(this.state.prefix)+
			"/sparql/"+
			this.wrapper.urlToParam(this.state.sparql);

	    return (
	    	<div id="source_selector">
		      	<form>
			        <label>
			          Url to ontology:
			          <input type="text" value={this.state.ontology} onChange={this.handleOntologyChange} />
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
		      	<NavLink to={url} style={
		      		(this.state.ontology.length>0 && this.state.sparql.length>0 && this.state.prefix.length>0)?{display:"block"}:{display:"none"}
		      	}>Go</NavLink>
		      	<NavLink to={url} style={
		      		(this.state.ontology.length>0 && this.state.sparql.length>0 && this.state.prefix.length>0)?{display:"block"}:{display:"none"}
		      	}>Use results from last analysis</NavLink>
	      	</div>
	    );
	}
}	

export default SourceSelector;