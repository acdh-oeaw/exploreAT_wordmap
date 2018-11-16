import React from "react";
import { BrowserRouter as Route, NavLink } from "react-router-dom";
import * as d3 from 'd3';
import { sparql } from 'd3-sparql'
import UrlParamWrapper from '../aux/UrlParamWrapper';
import SparqlQueryBuilder from '../aux/SparqlQueryBuilder';

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
		this.updateHighlights = this.updateHighlights.bind(this);

		this.basic_HighlightAttribute = this.basic_HighlightAttribute.bind(this);

		// Url query param based parameters
		this.api_url = this.wrapper.paramToUrl(this.props.match.params.sparql);
		this.ontology = this.wrapper.paramToUrl(this.props.match.params.ontology);
		this.prefix = this.wrapper.paramToUrl(this.props.match.params.prefix);
	}

	componentDidMount(){
		this.loadData();
	}

	componentWillUnmount(){
		this.simulation.stop();
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
		});
	}

	componentDidUpdate(prevProps, prevState, snapshot){
		if(prevState.loaded === false && this.state.loaded === true){
			this.createGraph();
		}
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
		        			this.updateHighlights(prevState);
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
		        			this.updateHighlights(prevState);
		        			return(prevState);
		        	});
		      	} else if (err) throw err
			});
		}
	}

	selectAttribute(attribute, origin){
		if(attribute && origin){
			const {predicate, target, object, sparql_triple} = this.attributeToQuery(attribute, origin);

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

	basic_HighlightAttribute(attribute){
		var lis = $('#current_entity > ul > li');
		for(var i=0; i<lis.length; i++){
			if(lis[i].innerHTML == attribute){
				$(lis[i]).toggleClass("li-selected")
			}
		}
	}

	updateHighlights(newState){
		const links = d3.select(this.node).selectAll("line.link");
		links.style('stroke', d=>{
			const query = this.attributeToQuery(d.relationship, d.source.entity);
			//console.log(d, query, newState.active_nodes[newState.active_nodes.length-1])
			if(d.source.entity == newState.active_nodes[newState.active_nodes.length-1]){
				return('blue')
			}
			if(newState.triples.includes(query.sparql_triple))
				return('rgb(102, 180, 58)')
			return('black');
		});
		const nodes = d3.select(this.node).selectAll('g.node circle').style('fill',d=>{
			if(newState.test_nodes.map(t=>t.name).includes(d.entity))
				return('rgb(102, 180, 58)')
			return('rgb(198, 233, 140)')
		})
	}

	createGraph(){
		// this.state.relationships
			// 	source
			// 	relationship
			// 	target
			// 	value
		const rect = this.svg.getBoundingClientRect(),
	    width = rect.width,
	    height = rect.height;

		const sizeScale = d3.scaleLinear()
			.domain([0,40000])
			.range([25,45])
			.clamp(true);

		const nodehash = {};
		this.state.entities.map(e=>{nodehash[e.entity] = e});
		const edges = this.state.relationships.map(d=>({
			source : nodehash[d.source],
			target : nodehash[d.target],
			relationship : d.relationship,
			value: d.value
		}));

		const linkForce = d3.forceLink().distance(140);

		const simulation = d3.forceSimulation()
			.force('charge', d3.forceManyBody().strength(-20))
			.force('center', d3.forceCenter(d3.select('svg').node().getBoundingClientRect().width/2, 200))
			.force('collide', d3.forceCollide(function(d){
			    sizeScale(nodehash[d.entity])*4
			}))
			.force('link', linkForce)
			.nodes(this.state.entities)
			.on('tick', forceTick);

		simulation.force("link").links(edges);

		this.simulation = simulation;

		const edgeEnter = d3.select(this.node).selectAll("line.link")
			.data(edges, d => `${d.source.entity}-${d.target.entity}`)
			.enter()
			.append("line") //.attr("marker-end","url(#arrow)")
			.attr("class", "link")
			.on("click",(d)=>{
				this.selectRelationship(d);
			})
			//.style("stroke-opacity", .5)
			//.attr('stroke', params.edgeColor)
			.style("stroke-width", d => d.value)
			.append("title")
      			.text(d=>d.relationship);

		const nodeEnter = d3.select(this.node).selectAll('g.node')
			.data(this.state.entities)
			.enter()
			.append('g')
			.attr('class', 'node')
			.attr('id', d=>this.wrapper.nameOfEntity(d.entity))
			.on("click",(d)=>{
				this.selectNode(d.entity)
			})
			.call(d3.drag()
            .on("start",dragstarted)
            .on("drag",dragged)
            .on("end",dragended));

		nodeEnter.append('circle')
			.attr('r', e=>sizeScale(e.count))
			//.style('fill', params.nodeColor);
		nodeEnter.append('text')
			.style("text-anchor", "middle")
			.attr("y", 25)
			.attr("class","node-name")
			.text(d => this.wrapper.nameOfEntity(d.entity));
		nodeEnter.append('text')
			.style("text-anchor", "middle")
			.attr("y", 0)
			.attr("class","node-count")
			.text(d => d.count);
		nodeEnter.append("title")
      		.text(d=>`${d.count} diferent entries`);

		function forceTick() {
			const rect = d3.select('svg').node().getBoundingClientRect(),
		    width = rect.width,
		    height = rect.height;

			d3.selectAll("line.link")
				.attr("x1", d => d.source.x)
				.attr("x2", d => d.target.x)
				.attr("y1", d => d.source.y)
				.attr("y2", d => d.target.y);

			d3.selectAll("g.node")
				.attr("transform", d => "translate("+
					Math.max(sizeScale(d.count), Math.min(width - sizeScale(d.count), d.x))+
					","+
					Math.max(sizeScale(d.count), Math.min(height - sizeScale(d.count), d.y))+")");
		}

		function dragstarted(d)
		{
			simulation.restart();
			simulation.alpha(1.0);
			d.fx = d.x;
			d.fy = d.y;
		}

		function dragged(d)
		{
			d.fx = d3.event.x;
			d.fy = d3.event.y;
		}

		function dragended(d)
		{
			d.fx = null;
			d.fy = null;
			simulation.alphaTarget(0.1);
		}
	}

	renderContent(){

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
					<div id="graph" width="100%" height="50%">
		        		<svg width="100%" height="50%" ref={node => this.svg = node}>
		        		  <defs>
						    <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
						      <path d="M0,0 L0,6 L9,3 z" fill="#f00" />
						    </marker>
						  </defs>
						  <g ref={node => this.node = node}></g>
		        		</svg>
					</div>
					<div style={({display: this.state.loaded===true?'inline-block':'none'})} id="nodes">
						<svg style={{height:'100%'}}>
							<g>
								<circle r="20" cx="22" cy="42" fill="grey"></circle>
									<g>
									<line x1={45} x2={300} y1={42} y2={42} stroke={'grey'}></line>
									<text fill="grey" x={80} y={35} fontSize={15}>[Name of the relationship]</text>
									</g>
								):""}
								<text x="0" y="15" fill="grey">
									[Name of the entity]
								</text>
								<text transform={`translate(0,95)`} fill="grey"> Atribute 1</text>
								<text transform={`translate(0,110)`} fill="grey"> Atribute 2</text>
								<text transform={`translate(0,125)`} fill="grey"> Atribute 3</text>

								{this.state.test_nodes.length==0?
								<text transform={`translate(0,155)`} fill="grey">Select a node from the graph to start building the query.</text>:
								(
									<g>
									<text transform={`translate(0,155)`} fill="grey">Select attributes from each node to add</text>
									<text transform={`translate(0,170)`} fill="grey">them to the query or select available </text>
									<text transform={`translate(0,185)`} fill="grey">edges in the graph to add a new entity</text>
									<text transform={`translate(0,200)`} fill="grey">to the selection.</text>
									<text transform={`translate(0,225)`} fill="grey">Attributes in the query appear in green.</text>
									</g>
								)}
								
							</g>
							{this.state.test_nodes.map((test_node,position)=>(
							<g transform={`translate(${(position+1)*300},0)`} key={position}>
								<circle r="20" cx="22" cy="42" fill="rgb(102, 180, 58)"></circle>
								{(position<(this.state.test_nodes.length-1))?(
									<g>
									<line x1={45} x2={300} y1={42} y2={42} stroke={'grey'}></line>
									<text x={80} y={35} fontSize={15} fontWeight={'bold'} fill="rgb(102, 180, 58)">
										{this.wrapper.nameOfEntity(this.state.active_edges[position])}
									</text>
									</g>
								):""}
								<text x="0" y="15">
									{this.wrapper.nameOfEntity(test_node.name)}
								</text>
								{test_node.attributes.map((e,i)=>(
									<text key={e.attribute} 
										onClick={()=>{
											this.basic_HighlightAttribute(this.wrapper.nameOfEntity(e.attribute))
											this.selectAttribute(e.attribute, test_node.name);
										}}
										transform={`translate(0,${i*15 + 80})`}>
										{this.wrapper.nameOfEntity(e.attribute)}
									</text>))
								}
							</g>

						))}

						</svg>
					</div>
		        </div>
		    </div>
	    );
	}
}

export default EntitySelector;
