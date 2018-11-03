import React from "react";
import { BrowserRouter as Route, NavLink } from "react-router-dom";
import UrlParamWrapper from '../aux/UrlParamWrapper';
import * as d3 from 'd3';
import { sparql } from 'd3-sparql'

const   genderQuery = ` 
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
  PREFIX oldcan: <https://explorations4u.acdh.oeaw.ac.at/ontology/oldcan#>

  Select ?questionnaire ?author ?title ?publicationYear ?lastName ?firstName  ?gender (COUNT(?question) as ?nQuestion) 
    from <http://exploreat.adaptcentre.ie/Questionnaire_graph>
    from <http://exploreat.adaptcentre.ie/Person_graph>
    from <http://exploreat.adaptcentre.ie/Question_graph>
  WHERE {
      ?questionnaire oldcan:hasAuthor ?author.
      ?questionnaire oldcan:title ?title.
      ?questionnaire oldcan:publicationYear ?publicationYear. 
      ?author oldcan:FirstName ?firstName.
      ?author oldcan:LastName ?lastName.
      ?author foaf:gender ?gender.
      ?question oldcan:isQuestionOf ?questionnaire. 
  } GROUP BY ?questionnaire ?title ?publicationYear ?author ?gender ?lastName ?firstName`

const getGraphsQuery = ()=>`
	SELECT ?graph
	WHERE {
	  GRAPH ?graph { }
	}
`;

const getEntitiesOverviewQuery = (graph_uri)=>`
	SELECT DISTINCT ?object (count (?subject) as ?count)
	from <`+graph_uri+`>
	WHERE {
  		?subject <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?object.
	}group by ?object
`;

const getEntitiesDetailQuery = (graph_uri)=>`
	SELECT ?object ?predicates ?count
	FROM <`+graph_uri+`>
	WHERE{
		{SELECT DISTINCT ?object 
		 WHERE {?subject <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?object}} .
		{SELECT (GROUP_CONCAT(DISTINCT ?predicate; SEPARATOR=",") AS ?predicates) (COUNT(DISTINCT ?predicate) AS ?count) 
		WHERE {?subject ?predicate []}}
	}
	limit 60
`;

class EntitySelector extends React.Component{
	constructor(props){
		super(props);
		this.state={
			entities: [],
			current_search: "",
			loaded: false,
			ontology:[],
			graphs: [],
			graph_entities: [],
			graphs_loaded: false,
			graph_entities_loaded: false,
			selected_graph: "",
			selected_entities: [],
			current_state: "Retrieving available graphs"
		};

		this.wrapper = new UrlParamWrapper();
		this.toggleEntitySelection = this.toggleEntitySelection.bind(this);
		this.handleFilterChange = this.handleFilterChange.bind(this);
	}

	componentDidMount(){
		this.retrieveGraphs()		  
	}
	
	retrieveGraphs(){
		const api_url = this.wrapper.paramToUrl(this.props.match.params.sparql);
	    sparql(api_url, getGraphsQuery(), (err, data) => {
	      if (data && !err) {
	        this.setState({graphs_loaded:true, graphs:data.map(g=>g.graph), current_state:'Retrieving entities from graphs'});
	      } else if (err) throw err
	    });
	}

	retrieveEntities(){
		const api_url = this.wrapper.paramToUrl(this.props.match.params.sparql);
		let retrieved = 0;

		this.state.graphs.map(graph_uri=>{
		    sparql(api_url, getEntitiesOverviewQuery(graph_uri), (err, data) => {
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

	retrieveGraphDetails(){

	}

	componentDidUpdate(prevProps, prevState, snapshot){
		if(prevState.loaded===false && this.state.loaded===true && this.state.ontology!=[]){
			console.log('ontology loaded', this.state.ontology)
		}else{
			if(prevState.graphs_loaded == false && this.state.graphs_loaded == true){
				console.log('Available graphs', this.state.graphs)
				this.retrieveEntities()
			}
			if(prevState.graph_entities_loaded == false && this.state.graph_entities_loaded == true){
				console.log('data correctly retrieved', this.state.graphs, this.state.graph_entities)
				this.setState({loaded:true})
			}
		}
	}

	toggleEntitySelection(entity){
		this.setState((prevState)=>{
			if(entity && entity.length>0)
				if(prevState.entities.includes(entity))
					prevState.entities = prevState.entities.filter(e=>e!=entity)
				else
					prevState.entities.push(entity)
			return(prevState);
		});
	};

	handleFilterChange(event){
		this.setState({current_search: event.target.value});
	};

	render() {
		const url = 
			"/explorer/ontology/"+
			this.props.match.params.ontology+
			"/sparql/"+
			this.props.match.params.sparql+
			"/entities/"+
			this.state.entities.map(e=>this.wrapper.urlToParam(e)).join(",");

		const filtered = (entity)=>(this.state.current_search!="" && entity.search(this.state.current_search)==-1);
		const style = (entity)=>({"fill":filtered(entity)===true?"lightgrey":"#18bc9c"});
		const action = (entity)=>(filtered(entity)===false?this.toggleEntitySelection(entity):()=>{});

		const graphs = this.state.graph_entities.map((g)=>(
			<div key={g.graph} className="graph">
				<p>{g.graph.split('/')[g.graph.split('/').length-1]} ({g.entities.reduce((a,e)=>a+e.count.valueOf(), 0)} entries)</p>
				<ul>
					{g.entities.map(e=>(<li key={e.object} className="entity">{e.object.split('ontology')[1]} ({e.count.valueOf()} entries)</li>))}
				</ul>
			</div>			
		));
		// const total_entries = this.state.graph_entities.reduce((total,g)=>(
		// 	g.entities.reduce((partial,e)=>partial+e.count.valueOf(), 0)), 0);

		// const graphs = this.state.graph_entities.map((g)=>{
		// 	const width = (15+20*g.entities.reduce((a,e)=>a+e.count.valueOf(),0)/total_entries)+'%';
		// 	return(
		// 	<div key={g.graph} className="graph" style={({width:width})}>
		// 		<p>{g.graph.split('/')[g.graph.split('/').length-1]} has {g.entities.reduce((a,e)=>a+e.count.valueOf(), 0)}</p>
		// 		<ul>
		// 			{g.entities.map(e=>(<li key={e.object} className="entity">{e.object.split('ontology')[1]} has {e.count.valueOf()} entries</li>))}
		// 		</ul>
		// 	</div>		
		// )});

		const pretty_entities = this.state.entities.map(a=>a.split('#')[1]).join(' , ');

	    return (
	    	<div id="explorer" className="entitySelector">
		        <div className="header">
		          <h2>Entity selection</h2>
		          <ul>
		            <li>Ontology : {this.wrapper.paramToUrl(this.props.match.params.ontology)}</li>
		            <li>Sparql entry point : {this.wrapper.paramToUrl(this.props.match.params.sparql)}</li>
		          </ul>
		          <ul>
		            <li>Current select entities :</li>
		            <li>> { pretty_entities }</li>
		          </ul>
		          <ul>
		            <li>Search for specific entities :</li>
		            <li><input type="text" value={this.state.current_search} onChange={this.handleFilterChange} /></li>
		          </ul>
		        </div>
		        <div id="loader" style={({display: this.state.loaded===true?'none':'flex'})}>
			        <div className="loader" ></div>
			        <p>{this.state.current_state}</p>
		        </div>
		        <div className="content">
		        	<div id="graphs">
						{this.state.loaded===true?graphs:""}
					</div>
			      	<NavLink to={url} style={
			      		(this.state.entities.length>0)?{display:"block"}:{display:"none"}
			      	}>Go</NavLink>
		        </div>
		    </div>
	    );
	}
}	

export default EntitySelector;