import React from "react";
import * as d3 from 'd3';
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
class EntityForceLayout extends React.Component{
	constructor(props){
		super(props);
		this.state={
			loaded: false, 
		};

		this.sparqlQueries = new SparqlQueryBuilder();
		this.wrapper = new UrlParamWrapper();
		this.updateHighlights = this.updateHighlights.bind(this);
		this.attributeToQuery = this.attributeToQuery.bind(this);
	}

	componentDidMount(){
	}

	componentWillUnmount(){
		this.simulation.stop();
	}
	componentDidUpdate(prevProps, prevState, snapshot){
        if(prevProps.dataAvailable === false && this.props.dataAvailable === true){
            this.createGraph();
            this.setState({loaded: true});
        }
		if(this.state.loaded === true){
            this.updateHighlights(this.props);
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
			object.predicate = this.sparqlQueries.shorttenURIwithPrefix(this.props.ontology, this.props.prefix, attribute);
			object.target = getAttributeForElement(this.props.relationships, object.predicate,'target',d=>d.relationship);

			//target != undefined when the predicate is a relationship (an edge)
			object.object = '?'+this.wrapper.nameOfEntity( object.target!=undefined?object.target:object.predicate);
			object.sparql_triple = `${object.subject} ${predicateToSparql(object.predicate)} ${object.object}`;
		}
		return(object);
	}

	updateHighlights(data){
		const links = d3.select(this.node).selectAll("line.link");
		links.style('stroke', d=>{
			const query = this.attributeToQuery(d.relationship, d.source.entity);
			//console.log(d, query, newState.active_nodes[newState.active_nodes.length-1])
			if(d.source.entity == data.active_nodes[data.active_nodes.length-1]){
				return('blue')
			}
			if(data.triples.includes(query.sparql_triple))
				return('rgb(102, 180, 58)')
			return('black');
		});
		const nodes = d3.select(this.node).selectAll('g.node circle').style('fill',d=>{
			if(data.test_nodes.map(t=>t.name).includes(d.entity))
				return('rgb(102, 180, 58)')
			return('rgb(198, 233, 140)')
		})
	}

	createGraph(){

		const rect = this.svg.getBoundingClientRect(),
	    width = rect.width,
	    height = rect.height;

		const sizeScale = d3.scaleLinear()
			.domain([0,40000])
			.range([25,45])
			.clamp(true);

		const nodehash = {};
		this.props.entities.map(e=>{nodehash[e.entity] = e});
		const edges = this.props.relationships.map(d=>({
			source : nodehash[d.source],
			target : nodehash[d.target],
			relationship : d.relationship,
			value: d.value
		}));

		const linkForce = d3.forceLink().distance(140);

		const simulation = d3.forceSimulation()
			.force('charge', d3.forceManyBody().strength(-300))
			.force('center', d3.forceCenter(d3.select('svg').node().getBoundingClientRect().width/2, 200))
			.force('collide', d3.forceCollide(function(d){
			    sizeScale(nodehash[d.entity])*4
			}))
			.force('link', linkForce)
			.nodes(this.props.entities)
			.on('tick', forceTick);

		simulation.force("link").links(edges);

		this.simulation = simulation;

		const edgeEnter = d3.select(this.node).selectAll("line.link")
			.data(edges, d => `${d.source.entity}-${d.target.entity}`)
			.enter()
			.append("line") //.attr("marker-end","url(#arrow)")
			.attr("class", "link")
			.on("click",(d)=>{
				this.props.selectRelationship(d);
			})
			//.style("stroke-opacity", .5)
			//.attr('stroke', params.edgeColor)
			.style("stroke-width", d => d.value)
			.append("title")
      			.text(d=>this.wrapper.nameOfEntity(d.relationship));

		const nodeEnter = d3.select(this.node).selectAll('g.node')
			.data(this.props.entities)
			.enter()
			.append('g')
			.attr('class', 'node')
			.attr('id', d=>this.wrapper.nameOfEntity(d.entity))
			.on("click",(d)=>{
				this.props.selectEntity(d.entity)
			})
			.call(d3.drag()
            .on("start",dragstarted)
            .on("drag",dragged)
            .on("end",dragended));

		nodeEnter.append('circle')
			.attr('r', e=>sizeScale(e.count))
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
				.attr("x1", d => Math.max(30, Math.min(width-30, d.source.x)))
				.attr("x2", d => Math.max(30, Math.min(width-30, d.target.x)))
				.attr("y1", d => Math.max(30, Math.min(height-30, d.source.y)))
				.attr("y2", d => Math.max(30, Math.min(height-30, d.target.y)))

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

	render() {
	    return (
            <div id="graph" width={this.props.width} height={this.props.height}>
                <svg width="100%" height="50%" ref={node => this.svg = node}>
                  <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                      <path d="M0,0 L0,6 L9,3 z" fill="#f00" />
                    </marker>
                  </defs>
                  <g ref={node => this.node = node}></g>
                </svg>
            </div>
	    );
	}
}

export default EntityForceLayout;

