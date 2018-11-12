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
			entities: [],
			relationships: [],
			selected_entities: [],
			current_state: "Retrieving available entities"
		};

		this.wrapper = new UrlParamWrapper();
		this.sparqlQueries = new SparqlQueryBuilder();
		this.handleFilterChange = this.handleFilterChange.bind(this);
		this.loadData = this.loadData.bind(this);

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
			console.log(this.state.entities, this.state.relationships);
			this.createGraph();
		}
	}

	handleFilterChange(event){
		this.setState({current_search: event.target.value});
	};

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
			.range([20,50])
			.clamp(true);

		const nodehash = {};
		this.state.entities.map(e=>{nodehash[e.entity] = e});
		const edges = this.state.relationships.map(d=>({
			source : nodehash[d.source],
			target : nodehash[d.target],
			relationship : d.relationship,
			value: d.value
		}));

		const linkForce = d3.forceLink().distance(200);

		const simulation = d3.forceSimulation()
			.force('charge', d3.forceManyBody().strength(-70))
			.force('center', d3.forceCenter(width/2, height/3))
			.force('collide', d3.forceCollide(function(d){
			    sizeScale(nodehash[d.entity])*2.2
			}))
			.force('link', linkForce)
			.nodes(this.state.entities)
			.on('tick', forceTick);

		simulation.force("link").links(edges);

		d3.select(this.node).selectAll("line.link")
			.data(edges, d => `${d.source.entity}-${d.target.entity}`) 
			.enter()
			.append("line") //.attr("marker-end","url(#arrow)")
			.attr("class", "link")
			.style("stroke-opacity", .5)
			.attr('stroke','grey')
			.style("stroke-width", d => d.value)
			.append("title")
      			.text(d=>d.relationship);;

		const nodeEnter = d3.select(this.node).selectAll('g.node')
			.data(this.state.entities)
			.enter()
			.append('g')
			.attr('class', 'node')
			.call(d3.drag()
            .on("start",dragstarted)
            .on("drag",dragged)
            .on("end",dragended));
 
		nodeEnter.append('circle')
			.attr('r', e=>sizeScale(e.count))
			.style('fill','lightblue');
		nodeEnter.append('text')
			.style("text-anchor", "middle")
			.attr("y", 25)
			.text(d => d.entity);
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

		        <div id="loader" style={({display: this.state.loaded===true?'none':'flex'})}>
			        <div className="loader" ></div>
			        <p>{this.state.current_state}</p>
		        </div>

		        <div className="content">
		        	<div id="graph">
		        		<svg width="100%" height="1200" ref={node => this.svg = node}>
		        		  <defs>
						    <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
						      <path d="M0,0 L0,6 L9,3 z" fill="#f00" />
						    </marker>
						  </defs>
						  <g ref={node => this.node = node}></g>
		        		</svg>
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