import React from "react";
import * as d3 from 'd3';
import UrlParamWrapper from '../aux/UrlParamWrapper';
import SparqlQueryBuilder from '../aux/SparqlQueryBuilder';
import * as cola from 'webcola'

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
		this.createGraph();
        this.setState({loaded: true});
	}

	componentWillUnmount(){
		//this.simulation.stop();
	}
	componentDidUpdate(prevProps, prevState, snapshot){
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
		const links = d3.select(this.node).selectAll("path.link");
		links.style('stroke', d=>{
			const query = this.attributeToQuery(d.relationship, d.source.entity);
			if(d.source.entity == data.active_nodes[data.active_nodes.length-1]){
				return('blue')
			}
			if(data.triples.includes(query.sparql_triple)){
				return('rgb(102, 180, 58)')
			}
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
			.range([17,40])
			.clamp(true);

		const nodehash = {};
		this.props.entities.map(e=>{nodehash[e.entity] = e});
		const edges = [];
		this.props.relationships.map(d=>{
			if(nodehash[d.source] && nodehash[d.target])
				edges.push({
					source : nodehash[d.source],
					target : nodehash[d.target],
					relationship : d.relationship,
					value: d.value
				});
			}
		);


		const linkForce = d3.forceLink().distance(160).strength(0.1);

		console.log(cola.d3adaptor(d3))


		const layout = cola.d3adaptor(d3)
		    .linkDistance(75)
		    .size([width, height])
		    .nodes(this.props.entities.map(x=>{
		    	x.width = sizeScale(x.count)*2+22;
		    	x.height = sizeScale(x.count)*2+22;
		    	x.id = x.entity;
		    	return x;
		    }))
		    .flowLayout('x',10)
		    .links(edges)
		    .symmetricDiffLinkLengths(30)
		    .jaccardLinkLengths(65, 1)
		    .handleDisconnected(true)
		    .avoidOverlaps(true)
		    .start(40,0,20);

		const edgeEnter = d3.select(this.node).selectAll("path.link")
			.data(edges, d => `${d.source.entity}-${d.target.entity}`)
			.enter()
			.append("path") //.attr("marker-end","url(#arrow)")
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
			.call(layout.drag);

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

      	layout.on('tick',forceTick);

		function forceTick() {
			//simulation.current_ticks += 1;/
			const rect = d3.select('svg').node().getBoundingClientRect(),
		    width = rect.width,
		    height = rect.height;

		    const link = d3.select('svg').selectAll("path.link"),
		    	node = d3.selectAll("g.node");

		    d3.select('svg').selectAll("path.link")
				.attr("d", function(d) {
			        const 
			        	source_x = Math.max(30, Math.min(width-30, d.source.x)),
			        	source_y = Math.max(30, Math.min(height-30, d.source.y)),
			        	target_x = Math.max(30, Math.min(width-30, d.target.x)),
			        	target_y = Math.max(30, Math.min(height-30, d.target.y)),
			        	dx = target_x - source_x,
			            dy = target_y - source_y,
			            dr = Math.sqrt(dx * dx + dy * dy);
			        return "M" + 
			            source_x + "," + source_y
			             + "A" + 
			            dr + "," + dr + " 0 0,1 " + 
			            target_x + "," + 
			            target_y;
			    });

			d3.selectAll("g.node").attr("transform", d=>`translate( 
				${Math.max(sizeScale(d.count), Math.min(width - sizeScale(d.count), d.x))} , 
				${Math.max(sizeScale(d.count), Math.min(height - sizeScale(d.count), d.y))})`);
		}

		function dragstarted(d)
		{
			//layout.restart();
			//layout.alpha(1)//.alphaDecay(0.025);
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
		}
	}

	render() {
	    return (
            <div id="graph">
                <svg ref={node => this.svg = node}>
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

