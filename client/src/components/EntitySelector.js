import React from "react";
import { BrowserRouter as Route, NavLink } from "react-router-dom";
import * as d3 from 'd3';
import { sparql } from 'd3-sparql'
import UrlParamWrapper from '../aux/UrlParamWrapper';
import SparqlQueryBuilder from '../aux/SparqlQueryBuilder';

/**
 * EntitySelector
 * Component for displaying entities and relationships in the SPARQL database 	
 * and selecting some for further analysis.
 *
 * @param props
 * @return {React.Component} 
 */
class EntitySelector extends React.Component{
	constructor(props){
		super(props);
		this.state={
			loaded: false, 
			loading:true, // For display issues
			current_search: "",
			selected_entities: [],
			current_state: "Retrieving available entities"
		};

		this.node = d3.select(this.node);

		this.wrapper = new UrlParamWrapper();
		this.sparqlQueries = new SparqlQueryBuilder();
		this.handleFilterChange = this.handleFilterChange.bind(this);

		// Url query param based parameters
		this.api_url = this.wrapper.paramToUrl(this.props.match.params.sparql);
		this.ontology = this.wrapper.paramToUrl(this.props.match.params.ontology);
		this.prefix = this.wrapper.paramToUrl(this.props.match.params.prefix);
	}

	componentDidMount(){	  
	}

	componentDidUpdate(prevProps, prevState, snapshot){

	}

	handleFilterChange(event){
		this.setState({current_search: event.target.value});
	};

	renderContent(){
	}

	render() {
		const url = 
			"/explorer/ontology/" + this.props.match.params.ontology+
			"/prefix/" +	this.props.match.params.prefix+
			"/sparql/" + this.props.match.params.sparql+
			"/entities/";

		const pretty_entities = this.state.selected_entities.map(a=>a.split('#')[1]).join(' , ');

	    return (
	    	<div id="explorer" className="entitySelector">
	    		<div className="header">
		          <h2>Entity selector</h2>
		          <div className="info">
		            <div>
		              <span>Ontology : {this.ontology}</span>
		              <span>Sparql entry point : {this.api_url}</span>
		            </div>
		            <span>
			            Search for specific entities 
			            <input type="text" value={this.state.current_search} onChange={this.handleFilterChange} />
		            Current selected entities : {pretty_entities}</span>
		          </div>
		        </div>

		        <div id="loader" style={({display: this.state.loading===true?'flex':'none'})}>
			        <div className="loader" ></div>
			        <p>{this.state.current_state}</p>
		        </div>

		        <div className="content">
		        	<div id="graph">
		        		<svg width="100%" height="100%" ref={node => this.domElement = node}></svg>
					</div>
			      	<NavLink to={url} style={
			      		(this.state.selected_entities.length>0)?{display:"block"}:{display:"none"}
			      	}>Go</NavLink>
		        </div>
		    </div>
	    );
	}
}	

export default EntitySelector;