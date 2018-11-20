import React from "react";
import UrlParamWrapper from '../aux/UrlParamWrapper';
import SparqlQueryBuilder from '../aux/SparqlQueryBuilder';
import * as d3 from 'd3';

/**
 * SparqlQueryCreator
 * Component for displaying entities and relationships in the SPARQL database
 * and selecting some for further analysis.
 *
 * @param props
 * @return {React.Component}
 */
class SparqlQueryCreator extends React.Component{
	constructor(props){
		super(props);
		this.state={
		};

		this.wrapper = new UrlParamWrapper();
		this.sparqlQueries = new SparqlQueryBuilder();
	}

	componentDidUpdate(prevProps, prevState, snapshot){
	}

	render() {
	    return (
            <div style={({display: this.props.loaded===true?'inline-block':'none'})} id="nodes">
                <svg>
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

                        {this.props.test_nodes.length==0?
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
                    {this.props.test_nodes.map((test_node,position)=>(
                    <g transform={`translate(${(position+1)*300},0)`} key={position} className="entity">
                        <circle r="20" cx="22" cy="42" fill="rgb(102, 180, 58)"></circle>
                        {(position<(this.props.test_nodes.length-1))?(
                            <g>
                            <line x1={45} x2={300} y1={42} y2={42} stroke={'grey'}></line>
                            <text x={80} y={35} fontSize={15} fontWeight={'bold'} fill="rgb(102, 180, 58)">
                                {this.wrapper.nameOfEntity(this.props.active_edges[position])}
                            </text>
                            </g>
                        ):""}
                        <text x="0" y="15">
                            {this.wrapper.nameOfEntity(test_node.name)}
                        </text>
                        {test_node.attributes.map((e,i)=>(
                            <text 
                                key={e.attribute} 
                                class="attribute" 
                                id={`${this.wrapper.nameOfEntity(test_node.name)}${this.wrapper.nameOfEntity(e.attribute)}`}
                                onClick={()=>{
                                    this.props.selectAttribute(e.attribute, test_node.name);
                                }}
                                transform={`translate(0,${i*18 + 80})`}>
                                {this.wrapper.nameOfEntity(e.attribute)}
                            </text>))
                        }
                    </g>
                    ))}
                    <g 
                        transform={`translate(${d3.select('body').node().getBoundingClientRect().width - 160},100)`} 
                        style={({display: this.props.test_nodes.length>0?'inherit':'none'})}>
                        <text id="resetQueryButton" onClick={()=>this.props.resetQuery()}>reset the query</text>
                    </g>
                </svg>
            </div>
	    );
	}
}

export default SparqlQueryCreator;

