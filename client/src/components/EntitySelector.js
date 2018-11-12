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
			graphs_loaded: false,
			graph_entities_loaded: false,
			graph_details: false,
			loaded: false, 
			loading:true, // For display issues
			current_search: "",
			graphs: [],
			graph_entities: [],
			graph_details: [],
			selected_graph: "",
			selected_entities: [],
			selected_entities_uris: [],
			current_state: "Retrieving available graphs"
		};

		this.wrapper = new UrlParamWrapper();
		this.sparqlQueries = new SparqlQueryBuilder();
		this.toggleEntitySelection = this.toggleEntitySelection.bind(this);
		this.toggleSelectedGraph = this.toggleSelectedGraph.bind(this);
		this.handleFilterChange = this.handleFilterChange.bind(this);

		// Url query param based parameters
		this.api_url = this.wrapper.paramToUrl(this.props.match.params.sparql);
		this.ontology = this.wrapper.paramToUrl(this.props.match.params.ontology);
		this.prefix = this.wrapper.paramToUrl(this.props.match.params.prefix);
	}

	componentDidMount(){
		this.retrieveGraphs()		  
	}
	
	/**
	 * retrieveGraphs
	 * Retrieves all graphs in the SPARQL endpoint and sets them in the state
	 *
	 * @fires   this.setState()
	 */
	retrieveGraphs(){
	    sparql(this.api_url, this.sparqlQueries.getGraphsQuery(), (err, data) => {
	      if (data && !err) {
	        this.setState({
	        	graphs_loaded:true, 
	        	graphs:data.map(g=>g.graph), 
	        	current_state:'Retrieving entities from graphs'
	        });
	      } else if (err) throw err
	    });
	}

	/**
	 * retrieveEntities
	 * Retrieves all entities in the SPARQL endpoint for each graph available
	 *
	 * @fires   this.setState()
	 */
	retrieveEntities(){
		let retrieved = 0;

		this.state.graphs.map(graph_uri=>{
		    sparql(this.api_url, this.sparqlQueries.getEntitiesOverviewQuery(graph_uri), (err, data) => {
		      if (data && !err) {
		        this.setState(prevState=>{
		        	prevState.graph_entities.push({graph:graph_uri, entities:data});
		        	prevState.current_state= 'Entities retrieved for '+graph_uri;
		        	return prevState;
		        });
		        retrieved += 1;
		        if(retrieved == this.state.graphs.length)
		        	this.setState({graph_entities_loaded:true})
		      } else if (err) throw err
		    });
		});
	}

	/**
	 * retrieveGraphDetails
	 * Retrieves all predicates available in [this.state.selected_graph]
	 *
	 * @fires   this.setState()
	 */
	retrieveGraphDetails(){
		const graph_uri = this.state.selected_graph;

	    sparql(this.api_url, this.sparqlQueries.getEntitiesDetailQuery(graph_uri), (err, data) => {
	      if (data && !err) {
	        this.setState(prevState=>{
	        	prevState.graph_details={graph:graph_uri, entities:data};
	        	prevState.loading=false;
	        	prevState.graph_details_loaded= true;
	        	return prevState;
	        });
	      } else if (err) throw err
	    });
	}

	componentDidUpdate(prevProps, prevState, snapshot){
		if(prevState.loaded===false && this.state.loaded===true && this.state.ontology!=[]){
		}else{
			if(prevState.graphs_loaded == false && this.state.graphs_loaded == true){
				this.retrieveEntities()
			}
			if(prevState.graph_entities_loaded == false && this.state.graph_entities_loaded == true){
				this.setState({loaded:true, loading:false})
			}
			if(prevState.selected_graph != this.state.selected_graph && this.state.selected_graph != "")
				this.retrieveGraphDetails()
		}
	}

	toggleSelectedGraph(graph){
		if(graph!="")
			this.setState({selected_graph: graph, graph_details_loaded:false, loading:true, current_state:'Retrieving details for '+graph})
		else
			this.setState({selected_graph: graph})
	}

	toggleEntitySelection(entity){
		this.setState((prevState)=>{
			if(entity && entity.length>0)
				if(prevState.selected_entities.includes(entity))
					prevState.selected_entities = prevState.selected_entities.filter(e=>e!=entity)
				else{
					prevState.selected_entities.push(entity)
					if(-1 != entity.search(this.ontology)){
						entity = this.prefix + ":" + entity.split(this.ontology+"#")[1];
						prevState.selected_entities_uris.push(this.state.selected_graph+'+'+entity);
					}else
						prevState.selected_entities_uris.push(this.state.selected_graph+'+'+entity)
				}
			return(prevState);
		});
	};

	handleFilterChange(event){
		this.setState({current_search: event.target.value});
	};

	/**
	 * renderContent
	 * Either render a global view of the database and its graphs, or a detailed view
	 * of a graph and the possible relationships.
	 *
	 * @return {JSX} Content for the EntitySelector screen.
	 */
	renderContent(){
		/* Content for EntitySelector is created based on whether all graphs or specific
		   predicates for the selected graph should be displayed*/
		let content = "";
		if(this.state.loaded===true && this.state.selected_graph=="")
			content = this.state.graph_entities.map((g)=>(
				<div key={g.graph} className="graph" onClick={()=>this.toggleSelectedGraph(g.graph)}>
					<p>{g.graph.split('/')[g.graph.split('/').length-1]} ({g.entities.reduce((a,e)=>a+e.count.valueOf(), 0)} entries)</p>
					<ul>
						{g.entities.map(e=>(<li key={e.object} className="entity">{e.object.split('ontology')[1]} ({e.count.valueOf()} entries)</li>))}
					</ul>
				</div>			
			));
		else if(this.state.graph_details_loaded===true && this.state.selected_graph!="")
			content = (
				<div className="graphDetails">
					<h1>Graph : {this.state.selected_graph}</h1>
					<h2 onClick={()=>this.toggleSelectedGraph("")}>Go back</h2>
					<div id="details">
						{this.state.graph_details.entities.map((g)=>(
							<div key={g.object} className="entity">
								<p>Entity : {g.object.split('/')[g.object.split('/').length-1]}</p>
								<ul>
									{g.predicates.split(',').map(e=>(<li key={e} className="entity" onClick={()=>this.toggleEntitySelection(e)}>{e}</li>))}
								</ul>
							</div>		
						))}
					</div>
				</div>
			);

		return(content);
	}

	render() {
		const url = 
			"/explorer/ontology/" + this.props.match.params.ontology+
			"/prefix/" +	this.props.match.params.prefix+
			"/sparql/" + this.props.match.params.sparql+
			"/entities/" + this.state.selected_entities_uris.map(e=>this.wrapper.urlToParam(e)).join(",");

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
			        <div className="tooltip" style={
			      		(this.state.loading === false)?{display:"flex"}:{display:"none"}
			      	}>
				      	<p>Select the relationships you want to explore in the dashboard.Links between graphs will be
				        asumed in the order entities <br />are selected from them. <i>(graphs A and B are related as A->B if relationships
				        are firstly selected from A and then from B)</i>.
				        </p>
			        </div>
		        	<div id="graphs">
						{this.state.loading===false?this.renderContent():""}
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