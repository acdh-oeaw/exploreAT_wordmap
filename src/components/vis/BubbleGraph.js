import * as d3 from 'd3';
import React from 'react';

/* BubbleGraph
 * BubbleGraph visualization for representing the evolution or distribution 
 * of an aggregation over a variable
 * 
 * It must receive at least one aggregated attribute and another one not aggregated
 *
 * The component updates each time the data is been filtered, or the size of the
 * container changes.
 *
 * The following props are been passed to the component:
 - data: the array of objects for each of the entries
 - filters: a js object with the keys been the names of the dimensions and the key the filters
 - updateFilteredData: a method to be called each time a filter is been changed in this component,
 -      which will trigger an update that will enable the components to be aware of the filters.
 */

 /* How highlighting can be done
  * 
  * className={`${this.state.legend}-${last_field_of_uri(String(d.key))}`}
  * An example on how it would en up a class : "Questionnaire-57"
  *
  * onMouseEnter={()=>this.highlightEntities(`${this.state.legend}-${last_field_of_uri(String(d.key))}`)}
  * onMouseOut={()=>this.unhighlightEntities()}

 */
const params = {
    legendWidth: 200,
    margin: 25, // for the selection of 
    padding: 70,
    axisTickLength: 14,
    paddingBottom: 70,
 };

class BubbleGraph extends React.Component{
    constructor(props){
        super(props);
        this.updateData = this.updateData.bind(this);

        this.availableCuantitativeDimensions = 
            props.attributes.filter(x=>x.type=="num"||x.aggregation!="none");
        this.availableXAxisDimensions = 
            props.attributes.filter(x=>x.type=="string"&&x.aggregation=="none");

        const state = {
            cuantitativeDimension: this.availableCuantitativeDimensions[0],
            xAxisDimension: this.availableXAxisDimensions[0],
            data: this.updateData(props.data,
                this.availableCuantitativeDimensions[0],
                this.availableXAxisDimensions[0]),
            forceX: d3.forceX(),
            forceY: d3.forceY(),
            simulation: d3.forceSimulation(),
            searchTerm: '',
            shouldUpdateForce: true
        };

        this.state = state;

        this.node = d3.select(this.node);
        this.selectCuantitativeAttribute = this.selectCuantitativeAttribute.bind(this);
        this.selectClusterAttribute = this.selectClusterAttribute.bind(this);
        this.highlightEntities = this.highlightEntities.bind(this);
        this.unhighlightEntities = this.unhighlightEntities.bind(this);
        this.filterBySomeAttribute = this.filterBySomeAttribute.bind(this);
        this.setSortBy = this.setSortBy.bind(this);
        this.renderBubbleGraph = this.renderBubbleGraph.bind(this);
        this.stripUri = (value)=>String(value).includes('/')?value.split('/')[value.split('/').length-1]:value;
        this.sanitizeClassName = (name)=>(name.replace(/"/g,'').replace(/\./g,'').replace(/ /g, ''));
    }

    componentDidMount(){
        this.renderBubbleGraph();
    }

    componentWillUnmount(){
        this.state.simulation.stop();
    }

    shouldComponentUpdate(nextProps, nextState) {
        let shouldUpdate = false;

        shouldUpdate = shouldUpdate || (nextState.sortBy != this.state.sortBy);
        shouldUpdate = shouldUpdate || (nextState[`${nextState.sortBy}SortOrder`] != this.state[`${nextState.sortBy}SortOrder`]);
        shouldUpdate = shouldUpdate || (nextProps.width != this.props.width);
        shouldUpdate = shouldUpdate || (nextProps.height != this.props.height);
        shouldUpdate = shouldUpdate || (nextProps.data != this.props.data);
        shouldUpdate = shouldUpdate || (nextState.data != this.state.data);
        shouldUpdate = shouldUpdate || (nextState.cuantitativeDimension != this.state.cuantitativeDimension);
        shouldUpdate = shouldUpdate || (nextState.xAxisDimension != this.state.xAxisDimension);

        return shouldUpdate;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.data != this.props.data){
            const data = this.updateData(this.props.data,
                this.state.cuantitativeDimension,
                this.state.xAxisDimension);
            this.setState({data},this.renderBubbleGraph);
        }
        if(prevProps.width != this.props.width){
            this.updateBubbleGraphSize();
        }
        if(prevProps.height != this.props.height){
            this.updateBubbleGraphSize();
        }
    }

    // UpdateData makes the aggregation
    updateData(data, cuantTerm, aggrTerm){
        let results_map = {}, aggregated = new Map();
        for(let x of data){
            const label = String(x[cuantTerm.aggregation_term]), 
                aggrTerm_value = String(x[aggrTerm.attribute]);
            let value = 1;

            // building an array with the calculation done over the aggregation term 
            // aggregated by the attributed used in the x axis 
            if(results_map[label]){
                if(results_map[label][aggrTerm_value])
                    value = results_map[label][aggrTerm_value] + 1;
            }else{
                results_map[label] = {};
            }
            results_map[label][aggrTerm_value] = value;

            // building a Map with each of different values of the aggregated data so that 
            // there's extra computation by calculating twice the the times the value, but the data 
            // is looped once
            let entry = {}
            entry[cuantTerm.aggregation_term] = label;
            entry[aggrTerm.attribute] = aggrTerm_value;
            entry.value = value;

            aggregated.set(aggrTerm_value, aggregated.has(aggrTerm_value)?
                aggregated.get(aggrTerm_value).set(label, entry):
                (new Map()).set(label,entry));

        }
        
        return(Array.prototype.concat(...Array.from(aggregated.values()).map(x=>Array.from(x.values()))));
    }

    renderBubbleGraph(){
        const stripUri = this.stripUri,
            sanitizeClassName = this.sanitizeClassName,
            height = this.props.height-60,
            width = this.props.width;

        const x = d3.scalePoint()
            .domain(this.state.data.map(d=>d[this.state.xAxisDimension.attribute]))
            .range([params.padding + params.margin, width - params.padding - params.margin]);

        const radius = d3.scaleLinear()
            .domain(
                [d3.min(this.state.data.map(d => d.value)), 
                d3.max(this.state.data.map(d => d.value))])
            .range([5,20]);

        const xAxis = g => g
            .attr("transform", `translate(0,${height - params.paddingBottom})`)
            .call(d3.axisBottom(x)
                .ticks(width / 80)
                .tickSizeOuter(0)
                .tickFormat(d=>this.stripUri(String(d)).substring(0,params.axisTickLength)))
            .call(g => g.select(".domain").remove());

        const svg = d3.select(this.svg);
        
        const node = d3.select(this.vis);


        const circles = node
            .selectAll('circle')
            .data(this.state.data);
        circles.exit().remove();
        circles
            .enter().append("circle")
            .attr('transform', `translate(${width/2},${height/2})`)
            .append('title');

        const attrName = this.state.cuantitativeDimension.aggregation_term;

        node.selectAll('circle')
            .attr("r", d=>radius(d.value))
            .attr('class',d=>`${attrName}-${stripUri(String(d[attrName]))}`)
            .attr("fill", d => this.props.colorScales[this.state.cuantitativeDimension.aggregation_term](
                this.sanitizeClassName( this.stripUri( String(d[this.state.cuantitativeDimension.aggregation_term])))))
            .on("mouseover", this.highlightEntities)
            .on("mouseout", this.unhighlightEntities)
            .on("click",d=>this.filterBySomeAttribute(
                this.state.cuantitativeDimension.aggregation_term, 
                String(d[this.state.cuantitativeDimension.aggregation_term])));

        node.selectAll('circle')
            .each(function(d){
                d3.select(this).select('title')
                    .text(d=>d[attrName]);
            })

        d3.select(this.axis)
              .call(xAxis);

        svg.selectAll('g.tick text')
            .attr("transform", "rotate(50), translate(8,-5)")
            .attr('text-anchor','start');

        this.state.forceX.x((d) => x(d[this.state.xAxisDimension.attribute]))
        this.state.forceY.y((d) => (this.props.height / 2) - params.axisTickLength)

        this.state.simulation
            .velocityDecay(0.3)
            .force('x', this.state.forceX)
            .force('y', this.state.forceY)
            .force('collide', d3.forceCollide(15))

        this.state.simulation.nodes(this.state.data)
            .on('tick', function() {
                node.selectAll('circle')
                    .attr('transform', d => {
                        const x = Math.max(params.margin, Math.min(d.x, width-params.margin));
                        const y = Math.max(params.margin, Math.min(d.y, height - params.margin));

                        return `translate(${x}, ${y})`
                    })
        });
        this.state.simulation.alpha(1).restart() ;
    }

    updateBubbleGraphSize(){
        const stripUri = this.stripUri,
            sanitizeClassName = this.sanitizeClassName,
            height = this.props.height-60,
            width = this.props.width;

        const x = d3.scalePoint()
            .domain(this.state.data.map(d=>d[this.state.xAxisDimension.attribute]))
            .range([params.padding + params.margin, width - params.padding - params.margin]);

        const xAxis = g => g
            .attr("transform", `translate(0,${height - params.paddingBottom})`)
            .call(d3.axisBottom(x)
                .ticks(width / 80)
                .tickSizeOuter(0)
                .tickFormat(d=>this.stripUri(String(d)).substring(0,params.axisTickLength)))
            .call(g => g.select(".domain").remove());

        const svg = d3.select(this.svg);
        d3.select(this.axis)
              .call(xAxis);

        svg.selectAll('g.tick text')
            .attr("transform", "rotate(50), translate(8,-5)")
            .attr('text-anchor','start');

        this.state.forceX.x((d) => x(d[this.state.xAxisDimension.attribute]))
        this.state.forceY.y((d) => (this.props.height / 2) - params.axisTickLength)

        this.state.simulation
            .force('x', this.state.forceX)
            .force('y', this.state.forceY)

        this.state.simulation.nodes(this.state.data)
            .on('tick', function() {
                svg.selectAll('circle')
                    .attr('transform', d => {
                        const x = Math.max(params.margin, Math.min(d.x, width-params.margin));
                        const y = Math.max(params.margin, Math.min(d.y, height - params.margin));

                        return `translate(${x}, ${y})`
                    })
        })

        this.state.simulation.alpha(1).restart() 
    }

    selectCuantitativeAttribute(attribute){
        this.setState(prev=>({
            cuantitativeDimension: attribute,
            xAxisDimension: prev.xAxisDimension,
            data: this.updateData(this.props.data,
                attribute,
                prev.xAxisDimension),
        }),this.renderBubbleGraph);
    }

    selectClusterAttribute(attribute){
        this.setState(prev=>({
            cuantitativeDimension: prev.cuantitativeDimension,
            xAxisDimension: attribute,
            data: this.updateData(this.props.data,
                prev.cuantitativeDimension,
                attribute),
        }),this.renderBubbleGraph);
    }

    // Example of to use filtering
    filterBySomeAttribute(attribute, value){
        this.props.filters[attribute].filter(x=>String(x).includes(value));
        this.props.updateFilteredData()
    }

    highlightEntities(d){
        const attrName = this.state.cuantitativeDimension.aggregation_term;
        d3.selectAll(`.${attrName}-${this.stripUri(String(d[attrName]))}`).classed('hovered',true);
    }


    unhighlightEntities(d){
        d3.selectAll(".hovered").classed('hovered',false)
    }

    setSortBy(value){
        this.setState(prev=>({
            keySortOrder:((value!='key' && prev.keySortOrder == 'up')
                || (value=='key' && value==prev.sortBy && prev.keySortOrder == 'down')
                || (value=='key' && value!=prev.sortBy && prev.keySortOrder=='up')
                ?'up':'down'),
            valueSortOrder:((value!='value' && prev.valueSortOrder == 'up')
                || (value=='value' && value==prev.sortBy && prev.valueSortOrder == 'down')
                || (value=='value' && value!=prev.sortBy && prev.valueSortOrder=='up')
                ?'up':'down'),
            sortBy:value,
            sortingFunction: this.sortingFunctions[value][(prev.sortBy!=value?prev[`${value}SortOrder`]:(prev[`${value}SortOrder`]=='up'?'down':'up'))]
        }));
    }

    render(){
        const size = {
            width: this.props.width+"px",
            height: (this.props.height)+"px"
        }
        const styleAttr1 = (e)=>this.state.cuantitativeDimension.name==e?{cursor:"pointer",color:"#18bc9c", marginLeft:"5px"}:
            {cursor:"pointer",color:"black", marginLeft:"5px"};

        const styleAttr2 = (e)=>this.state.xAxisDimension.name==e?{cursor:"pointer",color:"#18bc9c", marginLeft:"5px"}:
            {cursor:"pointer",color:"black", marginLeft:"5px"};
        
        return(
            <div id="BubbleGraph" className="visualization" style={size} ref={node => this.domElement = node}>
                <p style={{margin:0}}>Select the size attribute : {this.availableCuantitativeDimensions.map(e=>(
                    <span key={e.name} onClick={()=>this.selectCuantitativeAttribute(e)} style={styleAttr1(e.name)} className="option"> {e.name} </span>
                ))}</p>
                <p style={{margin:0}}>Select the cluster attribute : {this.availableXAxisDimensions.map(e=>(
                    <span key={e.name} onClick={()=>this.selectClusterAttribute(e)} style={styleAttr2(e.name)} className="option"> {e.name} </span>
                ))}</p>

                <svg ref={node => this.svg = node} 
                    width={this.props.width-params.margin} 
                    height={this.props.height-params.margin}>
                    <g id="vis" ref={node => this.vis = node}></g>
                    <g id="axis" ref={node => this.axis = node}></g>
                </svg>
            </div>
        );
    }
}

BubbleGraph.prototype.help="Bubble Graph\n"+
    "Used to visually identify how the disrtibution of some aggregation changes with a second variable.\n\n"+
    "Data used in the visualization:\n"+
    "One aggregation wich will determine the size of the bubbles, and a second not-aggregated variable\n"+
    "which will be used to distribute and cluster the bubbles along an horizontal axis.\n\n"+
    "Visual representation:\n"+
    "A set of bubbles which represent a value for the variable used for aggregating, which size is\n"+
    "proportional to the number of occurencies. The bubbles are distributed along an horizontal axis based\n"+
    "on the value of the not-aggregated variableselected.\n\n"+
    "Configuration:\n"+
    "The available aggregations for creating or clustering the bubbles can be cycled through by clicking on\n"+
    "the names.";

export default BubbleGraph;
