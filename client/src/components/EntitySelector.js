import React from "react";
import { BrowserRouter as Route, NavLink } from "react-router-dom";
import * as d3 from 'd3';
import { sparql } from 'd3-sparql'
import UrlParamWrapper from '../aux/UrlParamWrapper';
import SparqlQueryBuilder from '../aux/SparqlQueryBuilder';
import relationships from './relationships_sparql_oldcan.js'
import EntityForceLayout from './EntityForceLayout.js';
import SparqlQueryCreator from './SparqlQueryCreator.js';

const params = {
	nodeColor: 'lightgreen',
	activeNodeColor: 'red',
	edgeColor: 'grey',
	activeEdgeColor: 'red'
};

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
			entities: [],
			relationships: [],
			selected_entities: [],
			triples: [],
			current_state: "Retrieving available entities",
			active_nodes: [],
			active_edges: [],
			test_nodes : [],
		};

		this.wrapper = new UrlParamWrapper();
		this.sparqlQueries = new SparqlQueryBuilder();
		this.loadData = this.loadData.bind(this);

		this.selectAttribute = this.selectAttribute.bind(this);
		this.attributeToQuery = this.attributeToQuery.bind(this);
		this.selectNode = this.selectNode.bind(this);
		this.selectRelationship = this.selectRelationship.bind(this);
		this.resetQuery = this.resetQuery.bind(this);

		// Url query param based parameters
		this.api_url = this.wrapper.paramToUrl(this.props.match.params.sparql);
		this.ontology = this.wrapper.paramToUrl(this.props.match.params.ontology);
		this.prefix = this.wrapper.paramToUrl(this.props.match.params.prefix);
	}

	componentDidMount(){
		this.loadData();
	}

	loadData(){
		new Promise((resolve,reject)=>{
			sparql(this.api_url, this.sparqlQueries.getAvailableEntities(this.ontology, this.prefix), (err, data) => {
		      	if (data && !err) {
		        	this.setState({ current_state:'Retrieving relationships'});
		        	resolve(data)
		      } else if (err) throw err
			});
		}).then((entities)=>{
			const curatedEntities = entities.map(e=>({
      			entity : (e.entity.includes(this.ontology+'#')===false?e.entity:(this.prefix+':'+e.entity.split(this.ontology+'#')[1])),
      			count : +e.count
      		}));
			this.setState({
        		entities: curatedEntities,
        		relationships:relationships,
        		current_state:'Loaded successfuly',
        		loaded: true
        	});
/*
			sparql(this.api_url, this.sparqlQueries.getEntityRelationships(this.ontology, this.prefix), (err, data) => {
		      	if (data && !err) {

		      		const curatedEntities = entities.map(e=>({
		      			entity : (e.entity.includes(this.ontology+'#')===false?e.entity:(this.prefix+':'+e.entity.split(this.ontology+'#')[1])),
		      			count : +e.count
		      		}));

		      		const curatedRelationships = data.map(e=>({
		      			source: (e.entity.includes(this.ontology+'#')===false?e.entity:(this.prefix+':'+e.entity.split(this.ontology+'#')[1])),
		      			relationship: (e.relationship.includes(this.ontology+'#')===false?e.relationship:(this.prefix+':'+e.relationship.split(this.ontology+'#')[1])),
		      			target: (e.to.includes(this.ontology+'#')===false?e.to:(this.prefix+':'+e.to.split(this.ontology+'#')[1])),
		      			value: 6.5,
		      		}));

		        	this.setState({
		        		entities: curatedEntities,
		        		relationships:curatedRelationships,
		        		current_state:'Loaded successfuly',
		        		loaded: true
		        	});
		      } else if (err) throw err
			});
*/
		});
	}

	componentDidUpdate(prevProps, prevState, snapshot){
	}

	attributeToQuery(attribute, origin){
		// predicateToSparql wrapps the predicate in <> if it does no use a prefix
		const predicateToSparql = (p)=>((p.search('http://')!=-1)?('<'+p+'>'):p);

		// getAttributeForElement retrieves the desired attribute for the element
		// of a given array. The accesor provides a way to compare by the type of
		// the value given in "element"
		const getAttributeForElement = (array, element, attribute, accesor)=>(
			array.reduce((final, actual)=>(
				accesor(actual)==element?actual[attribute]:final), undefined)
			);

		let object = {};

		if(attribute && attribute.length>0){
			object.subject = '?'+this.wrapper.nameOfEntity( origin);
			object.predicate = this.sparqlQueries.shorttenURIwithPrefix(this.ontology, this.prefix, attribute);
			object.target = getAttributeForElement(this.state.relationships, object.predicate,'target',d=>d.relationship);

			//target != undefined when the predicate is a relationship (an edge)
			object.object = '?'+this.wrapper.nameOfEntity( object.target!=undefined?object.target:object.predicate);
			object.sparql_triple = `${object.subject} ${predicateToSparql(object.predicate)} ${object.object}`;
		}
		return(object);
	}

	selectNode(entity){
		if(this.state.test_nodes.length==0){
			if(entity && entity.length>0){
			sparql(this.api_url, this.sparqlQueries.getEntityAttributes(this.ontology, this.prefix, entity), (err, data) => {
		      	if (data && !err) {
		        	this.setState(prevState=>{
		        			prevState.test_nodes.push({	name: entity, attributes: data});
		        			prevState.active_nodes.push(entity)
		        			return(prevState);
		        	});
		      	} else if (err) throw err
				});
			}
		}
	}

	selectRelationship(relationship){
		if(relationship && relationship.source.entity == this.state.active_nodes[this.state.active_nodes.length-1]){
			const query = this.attributeToQuery(relationship.relationship ,relationship.source.entity)
			sparql(this.api_url, this.sparqlQueries.getEntityAttributes(this.ontology, this.prefix, query.target), (err, data) => {
		      	if (data && !err) {
		        	this.setState(prevState=>{
		        			prevState.test_nodes.push({	name: query.target, attributes: data});
		        			prevState.triples.push(query.sparql_triple);
		        			prevState.selected_entities.push(relationship.relationship)
		        			prevState.active_edges.push(relationship.relationship);
		        			prevState.active_nodes.push(query.target);
		        			return(prevState);
		        	});
		      	} else if (err) throw err
			});
		}
	}

	selectAttribute(attribute, origin){
		if(attribute && origin){
			const {predicate, target, object, sparql_triple} = this.attributeToQuery(attribute, origin);

			const svg_element = d3.select('#'+this.wrapper.nameOfEntity(origin)+this.wrapper.nameOfEntity(attribute));
			svg_element.classed('attribute-selected', svg_element.classed('attribute-selected')?false:true);

			if(this.state.selected_entities.includes(attribute)){
				//if(target != undefined) es una arista
					//seleccionas
				this.setState(prevState=>{
					prevState.selected_entities = prevState.selected_entities.filter(e=>e!=attribute);
					prevState.triples = prevState.triples.filter(e=>e!=sparql_triple);
					if(target!=undefined)
						prevState.active_edges = prevState.active_edges.filter(e=>e!=target);
					return prevState;
				});
			}
			else{
				//if(target != undefined) es una arista
					//deseleccionas
				this.setState(prevState=>{
					prevState.selected_entities.push(attribute);
					prevState.triples.push(sparql_triple);
					if(target!=undefined)
						prevState.active_edges.push(target);
					return prevState;
				});
			}
		}
	}

	toggleCurrentEntity(entity){
		if(entity && entity.length>0){
			this.setState(prevState=>{
				if(prevState.current_entity != entity)
					prevState.current_entity = entity;
				else{
					prevState.current_entity = "";
					prevState.current_entity_attributes = []
				}
				return(prevState);
			});
			this.updateEntityDetails(entity);
		}
	}

	resetQuery(){
		this.setState(prevState=>{
			prevState.selected_entities= [];
			prevState.triples= [];
			prevState.active_nodes= [];
			prevState.active_edges= [];
			prevState.test_nodes= [];
			return(prevState);
		});
	}

	render() {
		const url =
			"/explorer/ontology/" + this.props.match.params.ontology+
			"/prefix/" +	this.props.match.params.prefix+
			"/sparql/" + this.props.match.params.sparql+
			"/entities/" + this.state.triples.reduce((final, actual)=>final+this.wrapper.urlToParam(actual)+",","");

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
			            <input type="text" value={this.state.current_search}/>
			            <span onClick={()=>alert(this.state.triples)} style={{cursor:'pointer'}}>Show triples </span>
		            	</span>
		          </div>
		            <NavLink to={url} style={
			      		(this.state.selected_entities.length>0)?{display:"block"}:{display:"none"}
			      	} id="link-to-dashboard"> Go to dashboard</NavLink>
		        </div>

		        <div id="loader" style={({display: this.state.loaded===true?'none':'flex'})}>
			        <div className="loader" ></div>
			        <p>{this.state.current_state}</p>
		        </div>

		        <div className="content">
                    <EntityForceLayout 
                         width={'100%'}
                         height={'50%'}
                         entities={this.state.entities}
                         relationships={this.state.relationships}
                         selectEntity={this.selectNode}
                         selectRelationship={this.selectRelationship}
                         active_nodes={this.state.active_nodes}
                         active_edges={this.state.active_edges}
                         triples={this.state.triples}
                         test_nodes={this.state.test_nodes}
                         prefix={this.prefix}
                         ontology={this.ontology}
                         sparql={this.sparql}
                         dataAvailable={this.state.loaded}
                    /> 
                    <SparqlQueryCreator 
                          test_nodes={this.state.test_nodes}
                          active_edges={this.state.active_edges}
                          selectAttribute={this.selectAttribute}
                          resetQuery={this.resetQuery}
                          loaded={this.state.loaded}
                    />
		        </div>
		    </div>
	    );
	}
}

export default EntitySelector;

