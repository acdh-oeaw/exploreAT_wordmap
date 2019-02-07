import * as d3 from 'd3';
import React from 'react';

/* ViolinPlot
 * ViolinPlot visualization for representing the evolution or distribution 
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
    margin: 15, // for the selection of 
    padding: 50,
 };

class ViolinPlot extends React.Component{
    constructor(props){
        super(props);
        this.updateData = this.updateData.bind(this);

        const state = {
            selected_attribute: props.attributes[0],
            data: this.updateData(props.data, props.attributes[0]),
            searchTerm: '',
        };

        this.state = state;

        this.node = d3.select(this.node);
        this.selectAttribute = this.selectAttribute.bind(this);
        this.highlightEntities = this.highlightEntities.bind(this);
        this.unhighlightEntities = this.unhighlightEntities.bind(this);
        this.filterBySomeAttribute = this.filterBySomeAttribute.bind(this);
        this.setSortBy = this.setSortBy.bind(this);
        this.renderViolinPlot = this.renderViolinPlot.bind(this);
        this.stripUri = (value)=>String(value).includes('/')?value.split('/')[value.split('/').length-1]:value;
        this.sanitizeClassName = (name)=>(name.replace(/"/g,'').replace(/\./g,'').replace(/ /g, ''));
    }

    componentDidMount(){
        this.renderViolinPlot();
    }

    componentWillUnmount(){
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
                this.state.selected_attribute);
                
            this.setState({data},this.renderViolinPlot);
        }
        if(prevProps.width != this.props.width){
            this.renderViolinPlot();
        }
        if(prevProps.height != this.props.height){
            this.renderViolinPlot();
        }
    }

    // UpdateData makes the aggregation
    updateData(data, attribute){
        let results = {}, total=0, max=0;
        if(attribute.aggregation != 'none'){
            let unique = {}
            data.map(x=>{
                if(!unique[x[attribute.attribute]])
                    unique[x[attribute.attribute]] = x;
            });

            d3.values(unique).map(x=>{
                if(results[x[attribute.aggregation_term]]){
                    results[x[attribute.aggregation_term]] += 1;
                }
                else{
                    results[x[attribute.aggregation_term]] = 1;
                    total += 1;
                }
            })
        }else{
            results = data.map(x=>({Attribute:x}));
        }

        const mean = d3.values(results).reduce((a,b)=>{
            if(b > max)
                max=b;
            return a+b;
        },0) / total;

        return({entries:d3.entries(results),
            mean:mean,
            total:total,
            max:max
        });
    }

    renderViolinPlot(){
        const stripUri = this.stripUri,
            sanitizeClassName = this.sanitizeClassName,
            height = this.props.height,
            width = this.props.width,
            center = this.props.width/2-params.margin-params.padding;

        const yScale = d3.scaleLinear()
            .domain([0,this.state.data.max])
            .range([this.props.height-params.padding, params.padding]);

        const histogram = d3.histogram()
            .domain(yScale.domain())
            .thresholds(yScale.ticks(20))    // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
            .value(d => d.value);

        const bins = histogram(this.state.data.entries);
        const maxnum = bins.map(x=>x.length).reduce((a,b)=>a>b?a:b);

        const xNumScale = d3.scaleLinear()
            .domain([-maxnum,maxnum])
            .range([0,this.props.width-params.margin*2-params.padding*2]);

        const yAxis = g => g
            .attr("transform", `translate(${params.padding},0)`)
            .call(d3.axisLeft(yScale))
            .call(g => g.select(".domain").remove());

        d3.select(this.vis)
            .attr('transform', `translate(${params.padding + 35},0)`);

        d3.select(this.vis)
            .select('path')
            .datum(bins)
            .style("fill","#69b3a2")
            .attr("d", (d,i)=>d3.area()
                .x0(function(x){ return(xNumScale(-x.length) - 1) } )
                .x1(function(x){ return(xNumScale(x.length) + 1) } )
                .y(function(d){ return(yScale(d.x0)) } )
                .curve(d3.curveCatmullRom)    // This makes the line smoother to give the violin appearance. Try d3.curveStep to see the difference
                (d)
            );

        d3.select(this.axis)
              .call(yAxis);
    }

    selectAttribute(attr){
        const data = this.updateData(this.props.data, attr);

        this.setState({
            data,
            selected_attribute: attr,
        },this.renderViolinPlot)
    }

    // Example of to use filtering
    filterBySomeAttribute(attribute, value){
        this.props.filters[attribute].filter(value);
        this.props.updateFilteredData()
    }

    highlightEntities(d){
        d3.selectAll(`.${this.state.cuantitativeDimension.aggregation_term}-${this.sanitizeClassName(this.stripUri(String(d[0])))}`).classed('hovered',true);
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
            height: this.props.height+"px"
        }
        const style = (e)=>this.state.selected_attribute==e?{cursor:"pointer",color:"#18bc9c", marginLeft:"5px"}:
        {cursor:"pointer",color:"black", marginLeft:"5px"};
        
        return(
            <div id="ViolinPlot" className="visualization" style={size} ref={node => this.domElement = node}>
                <p style={{margin:'0 10px'}}>Select the attribute used for the bars : {this.props.attributes.map(e=>(
                    <span key={e.name} onClick={()=>this.selectAttribute(e)} className="option" style={style(e)}> {e.name} </span>
                ))}</p>

                <svg ref={node => this.svg = node} 
                    width={this.props.width-params.margin*2} 
                    height={this.props.height-params.margin*2}>
                    <g id="vis" ref={node => this.vis = node}><path></path></g>
                    <g id="axis" ref={node => this.axis = node}></g>
                </svg>
            </div>
        );
    }
}

ViolinPlot.prototype.help="Violin Plot\n"+
    "Allows to see the distribution of some numerical data.\n\n"+
    "Data used in the visualization:\n"+
    "A numerical attribute (usually an aggregation) which distribution is shown.\n\n"+
    "Visual representation:\n"+
    "The violin plot is a horizontally symetrical version of a turned density plot,\n"
    "where the width is proportional to the amount of occurencies of that value of \nthe aggregation.\n\n"+
    "Configuration:\n"+
    "The available aggregations for the representation can be cycled through by clicking on the names.";

export default ViolinPlot;