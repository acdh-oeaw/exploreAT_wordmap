import React from "react";
import { BrowserRouter as Route, NavLink } from "react-router-dom";
import UrlParamWrapper from '../aux/UrlParamWrapper';

class SourceSelector extends React.Component{
	constructor(props){
		super(props);
		this.state={
			ontology:"",
			sparql:""
		};

		this.wrapper = new UrlParamWrapper();
		this.handleOntologyChange = this.handleOntologyChange.bind(this);
		this.handleSparqlChange = this.handleSparqlChange.bind(this);

	}

	handleOntologyChange(event){
		this.setState({ontology: event.target.value});
	};

	handleSparqlChange(event){
		this.setState({sparql: event.target.value});
	};

	render() {
		const url = 
			"/explorer/ontology/"+
			this.wrapper.urlToParam(this.state.ontology)+
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
			          Sparql endpoint:
			          <input type="text" value={this.state.sparql} onChange={this.handleSparqlChange} />
			        </label>
		      	</form>
		      	<NavLink to={url} style={
		      		(this.state.ontology.length>0 && this.state.sparql.length>0)?{display:"block"}:{display:"none"}
		      	}>Go</NavLink>
	      	</div>
	    );
	}
}	

export default SourceSelector;