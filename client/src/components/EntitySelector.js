import React from "react";
import { BrowserRouter as Route, NavLink } from "react-router-dom";
import * as d3 from 'd3';
import { sparql } from 'd3-sparql'
import UrlParamWrapper from '../aux/UrlParamWrapper';
import SparqlQueryBuilder from '../aux/SparqlQueryBuilder';
import relationships from './relationships_sparql_oldcan.js'
import EntityForceLayout from './EntityForceLayout.js';
import SparqlQueryCreator from './SparqlQueryCreator.js';

import RdfBasedSourceSelector from './RdfBasedSourceSelector.js';
import SparqlBasedSourceSelector from './SparqlBasedSourceSelector.js';

const ENTITIES_FROM_RDF = false;
const SourceSelector = (ENTITIES_FROM_RDF === true)?
	RdfBasedSourceSelector:
	SparqlBasedSourceSelector;	

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
			current_search: "",
			selected_entities: [],
			triples: [],
			active_nodes: [],
			active_edges: [],
			test_nodes : [],
			ontology:null
		};

		this.wrapper = new UrlParamWrapper();
		this.sparqlQueries = new SparqlQueryBuilder();

		this.selectAttribute = this.selectAttribute.bind(this);
		this.attributeToQuery = this.attributeToQuery.bind(this);
		this.selectNode = this.selectNode.bind(this);
		this.selectRelationship = this.selectRelationship.bind(this);
		this.resetQuery = this.resetQuery.bind(this);
		this.renderContent = this.renderContent.bind(this);
		this.setSources = this.setSources.bind(this);
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
			object.predicate = this.sparqlQueries.shorttenURIwithPrefix(this.state.ontology.ontology_base, this.state.ontology.ontology_prefix, attribute);
			object.target = getAttributeForElement(this.state.ontology.relationships, object.predicate,'target',d=>d.relationship);

			//target != undefined when the predicate is a relationship (an edge)
			object.object = '?'+this.wrapper.nameOfEntity( object.target!=undefined?object.target:object.predicate);
			object.sparql_triple = `${object.subject} ${predicateToSparql(object.predicate)} ${object.object}`;
		}
		return(object);
	}

	selectNode(entity){
		if(this.state.test_nodes.length==0){
			if(entity && entity.length>0){
			sparql(this.state.sparql, this.sparqlQueries.getEntityAttributes(this.state.ontology.ontology_base, this.state.ontology.ontology_prefix, entity), (err, data) => {
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
			sparql(this.state.sparql, this.sparqlQueries.getEntityAttributes(this.state.ontology.ontology_base, this.state.ontology.ontology_prefix, query.target), (err, data) => {
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

	setSources(ontology, sparql){
		if(ontology != null && sparql.length>0){
			this.setState({ontology:ontology, sparql:sparql});
		}
	}

	renderContent(){
		if(this.state.ontology == null){
			return(
				<SourceSelector 
					setSources={this.setSources}
				/>
			);
		}else{
			return(
				<div className="content">
                    <EntityForceLayout 
                         width={'100%'}
                         height={'50%'}
                         entities={this.state.ontology.entities.map(e=>({entity:e.name, count:20}))}
                         relationships={this.state.ontology.relationships}
                         selectEntity={this.selectNode}
                         selectRelationship={this.selectRelationship}
                         active_nodes={this.state.active_nodes}
                         active_edges={this.state.active_edges}
                         triples={this.state.triples}
                         test_nodes={this.state.test_nodes}
                         prefix={this.state.ontology.prefix}
                         ontology={this.state.ontology.ontology_base}
                         sparql={this.state.sparql}
                    /> 
                    <SparqlQueryCreator 
                          test_nodes={this.state.test_nodes}
                          active_edges={this.state.active_edges}
                          selectAttribute={this.selectAttribute}
                          resetQuery={this.resetQuery}
                          loaded={true}
                    />
		        </div>
		     );
		}
	}

	render() {
		
		const url = (this.state.triples.length == 0)?"":
			"/explorer/ontology/" + this.wrapper.urlToParam(this.state.ontology.ontology_base)+
			"/prefix/" +	this.state.ontology.ontology_prefix+
			"/prefixes/" + this.state.ontology.prefixes.reduce((final, actual)=>final+this.wrapper.urlToParam(actual.prefix+actual.uri)+",","") + 
			"/sparql/" + this.wrapper.urlToParam(this.state.sparql)+
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
			            <span onClick={()=>alert(this.state.triples)} style={{cursor:'pointer'}}>Show triples </span>
		            	</span>
		          </div>
		            <NavLink to={url} style={
			      		(this.state.triples.length>0)?{display:"block"}:{display:"none"}
			      	} id="link-to-dashboard"> Go to dashboard</NavLink>
		        </div>
		        {this.renderContent()}		        
		    </div>
	    );
	}
}

export default EntitySelector;

