import * as d3 from 'd3';
import React from 'react';
import { Icon } from 'react-materialize';

/* BarChart
 * BarChart component to show aggregated data
 * Vis components are provided with width, height and data props
 *
 * Data is provided as an array of objects
 */
const params = {
    legendHeight: 70,
    marginTop: 45, // for the selection of 
    marginRight: 10, // because of the padding of the container
    paddingLeft:85,
    paddingTop: 35,
    paddingRight: 5,
    paddingBottom: 10,
 };

class BarChart extends React.Component{
    constructor(props){
        super(props);
        this.updatedData = this.updatedData.bind(this);

        const attribute = this.props.attributes[0];
        const {data, total} = this.updatedData(attribute);

        this.sortingFunctions = {
            key: {
                up: (a,b)=>(a.key < b.key),
                down: (a,b)=>(a.key > b.key),
            },
            value:{
                up: (a,b)=>(a.value < b.value),
                down: (a,b)=>(a.value > b.value),
            }
        };

        this.state = {
            legend: attribute[attribute.aggregation_term!='none'?'aggregation_term':'name'],
            sector_dimension:attribute.name,
            data: data,
            total: total,
            selected_attribute: attribute,
            sortBy: 'key',
            keySortOrder:'up',
            valueSortOrder:'up',
            sortingFunction: this.sortingFunctions['key']['up'],
        };

        this.node = d3.select(this.node);
        this.renderAxis = this.renderAxis.bind(this);
        this.createBars = this.createBars.bind(this);
        this.selectAttribute = this.selectAttribute.bind(this);
        this.highlightEntities = this.highlightEntities.bind(this);
        this.unhighlightEntities = this.unhighlightEntities.bind(this);
        this.setSortBy = this.setSortBy.bind(this);
        this.stripUri = (value)=>String(value).includes('/')?value.split('/')[value.split('/').length-1]:value;
        this.sanitizeClassName = (name)=>(name.replace(/"/g,'').replace(/\./g,'').replace(/ /g, ''));
    }

    shouldComponentUpdate(nextProps, nextState) {
        let shouldUpdate = false;

        shouldUpdate = shouldUpdate || (nextState.sortBy != this.state.sortBy);
        shouldUpdate = shouldUpdate || (nextState[`${nextState.sortBy}SortOrder`] != this.state[`${nextState.sortBy}SortOrder`]);
        shouldUpdate = shouldUpdate || (nextProps.width != this.props.width);
        shouldUpdate = shouldUpdate || (nextProps.height != this.props.height);
        shouldUpdate = shouldUpdate || (nextProps.data != this.props.data);
        shouldUpdate = shouldUpdate || (nextState.data != this.state.data);
        shouldUpdate = shouldUpdate || (nextState.selected_attribute != this.state.selected_attribute);

        return shouldUpdate;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.data != this.props.data){
            const {data, total} = this.updatedData(this.state.selected_attribute);
            this.setState({data,total});
        }
        this.renderAxis();
    }

    componentDidMount(){
        this.renderAxis();
    }

    updatedData(attribute){
        let data = {};
        let total = 0;
        if(attribute.aggregation != 'none'){
            let unique = {}
            this.props.data.map(x=>{
                if(!unique[x[attribute.attribute]])
                    unique[x[attribute.attribute]] = x;
            });

            d3.values(unique).map(x=>{
                if(data[x[attribute.aggregation_term]]){
                    data[x[attribute.aggregation_term]] += 1;
                    total += 1;
                }
                else{
                    data[x[attribute.aggregation_term]] = 1;
                    total += 1;
                }
            })
        }else{
            data = this.props.data.map(x=>({Attribute:x}));
            total = this.props.data.length;
        }

        return({data,total});
    }

    selectAttribute(attribute){
        const {data, total} = this.updatedData(attribute);

        this.setState({
            data, 
            total,
            legend: attribute[attribute.aggregation_term!='none'?'aggregation_term':'name'],
            sector_dimension:attribute.name, 
            selected_attribute: attribute,
        })
    }

    highlightEntities(selector){
        d3.selectAll('.'+selector).classed('hovered',true);
    }

    unhighlightEntities(d){
        d3.selectAll(".hovered").classed('hovered',false)
    }

    createBars(dimensions){
        const last_field_of_uri = (uri)=>uri.includes('/')?uri.split('/')[uri.split('/').length-1]:uri;
        const yScale = d3.scaleLinear()
            .domain([0,d3.values(this.state.data).reduce((a,b)=>a>b?a:b,0)])
            .range([0,dimensions.height]);
        this.yScale = yScale;
        this.drawWidth = dimensions.width-params.paddingRight-params.paddingLeft-this.state.legend.length*5;

        const bar_width = (dimensions.width-params.paddingRight-params.paddingLeft-this.state.legend.length*5)/d3.keys(this.state.data).length;
        let rotationAccumulated = 0;

        const bars = d3.entries(this.state.data).sort(this.state.sortingFunction).map((d,i)=>{
            // classValue is the stripped identifyer to be used for the class name
            // shortter names will yield faster search results
            let classValue = last_field_of_uri(String(d.key.valueOf()));
            const className = `${this.state.legend}-${this.sanitizeClassName(classValue)}`;
            
            const bar = (<rect 
                fill={this.props.colorScales[this.state.legend](this.sanitizeClassName( this.stripUri( d.key)))} 
                className={className}
                x={0}
                y={0}
                width={bar_width-2}
                height={yScale(d.value)}
                onMouseEnter={()=>this.highlightEntities(className)}
                onMouseOut={()=>this.unhighlightEntities()}
                onClick={()=>{
                    this.props.filters[this.state.selected_attribute.aggregation_term].filter(d.key);
                    this.props.updateFilteredData();
                }}
                ></rect>);
            
            return(<g key={d.key} transform={`translate(${params.paddingLeft + i*bar_width},${params.paddingTop+dimensions.height - yScale(d.value)})`}> 
                {bar}
                <text x={bar_width/2} y={15} className="barValue">{d.value}</text>
                <title>{d.key} - {d.value}</title>
            </g>);
        });

        return (
            <g>
                <g>{bars}</g>
                <g>
                {yScale.domain().map(d=>(<text key={d} transform={`translate(${params.paddingTop+dimensions.height - yScale(d)})`}>{d}</text>))}
                </g>
                {this.state.data!=null?this.createLegend(dimensions,bar_width):""}
            </g>
        );
    }

    createLegend(dimensions,bar_width){
        const last_field_of_uri = (uri)=>uri.includes('/')?uri.split('/')[uri.split('/').length-1]:uri;
        return(
        <g className="legend">
            <g transform={`translate(5,${params.paddingTop})`}
                onClick={()=>this.setSortBy("value")}>
                <text x="0" y="0" className={"sortBy"}>
                    Value 
                </text>
                <g transform={`translate(40,-10)`}>
                    {(this.state.valueSortOrder == 'up')?<polygon points="0 0, 13 0, 6.5 10.5" fill="black"/>:<polygon points="0 10.5, 6.5 0, 13 10.5" fill="black"/>}
                </g>
            </g>
            <g transform={`translate(${dimensions.width-params.paddingRight-this.state.legend.length*5+15},${params.paddingTop+dimensions.height})`}
                onClick={()=>this.setSortBy("key")}>
                <text x="0" y="0" className={"sortBy"}>
                    {this.state.legend}
                </text>
                <g transform={`translate(${this.state.legend.length * 8},-10)`}>
                    {(this.state.keySortOrder == 'up')?<polygon points="0 0, 13 0, 6.5 10.5" fill="black"/>:<polygon points="0 10.5, 6.5 0, 13 10.5" fill="black"/>}
                </g>
            </g>
            <g transform={`translate(0,${params.paddingTop+dimensions.height+10})`}>
                {d3.entries(this.state.data).sort(this.state.sortingFunction).map((d,i,all)=>(
                        <g transform={`translate(${params.paddingLeft + i*bar_width + bar_width/3})`} 
                                key={d.key} 
                                className={`${this.state.legend}-${last_field_of_uri(String(d.key))}`}
                                onMouseEnter={()=>this.highlightEntities(`${this.state.legend}-${last_field_of_uri(String(d.key))}`)}
                                onClick={()=>{
                                    this.props.filters[this.state.selected_attribute.aggregation_term].filter(d.key);
                                    this.props.updateFilteredData();
                                }}
                                onMouseOut={()=>this.unhighlightEntities()}>
                                <text transform="rotate(55,0,0)">{last_field_of_uri(d.key).slice(0,10)}</text>
                        </g>
                    ))
                }
            </g>
        </g>
        );
    }

    renderAxis(){
        if(this.yScale != null){
            const reversedScale = d3.scaleLinear()
                .domain([this.yScale.domain()[0],this.yScale.domain()[1]])
                .range([this.yScale.range()[1],this.yScale.range()[0]]);

            const yAxis = g => g
                .attr("transform", `translate(${this.drawWidth+params.paddingRight+params.paddingLeft-5},${params.paddingTop})`)
                .call(d3.axisLeft(reversedScale).tickSize(this.drawWidth));

            function customYAxis(g) {
                g.call(yAxis);
                g.select(".domain").remove();
                g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");
                g.selectAll(".tick text").attr("dy", -4);
            }

            d3.select(this.axis)
                .call(customYAxis);
        }
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
            width: (this.props.width - params.marginRight),
            height: (this.props.height - params.marginTop),
        }

        const chartDimensions = {
            width: (this.props.width - params.marginRight - params.paddingRight - params.paddingLeft),
            height: (this.props.height - params.marginTop - params.paddingTop - params.paddingBottom - params.legendHeight),   
        }

        const style = (e)=>this.state.sector_dimension==e?{cursor:"pointer",color:"#18bc9c", marginLeft:"5px"}:
        {cursor:"pointer",color:"black", marginLeft:"5px"};

        return(
            <div id="BarChart" className="visualization" style={{height:this.props.height+'px', width:this.props.width+'px'}} ref={node => this.domElement = node}>
                <p style={{margin:'0 10px'}}>Select the attribute used for the bars : {this.props.attributes.map(e=>(
                    <span key={e.name} onClick={()=>this.selectAttribute(e)} className="option" style={style(e.name)}> {e.name} </span>
                ))}</p>
                <svg style={size}>
                    <g ref={node => this.axis = node}></g> 
                    <g id="bars">
                        {this.state.data!=null?this.createBars(chartDimensions):""}
                    </g>
                </svg>
            </div>
        );
    }
}

BarChart.prototype.help="Bar Chart\n"+
    "Used to visually represent distribution of aggregated data.\n\n"+
    "Data used in the visualization:\n"+
    "Aggregated variables, which have the count of occurrencies for each value of the aggregation term.\n\n"+
    "Visual representation:\n"+
    "Each of the different values of the variable used for aggregating has its own bar with a height \n"+
    "proportional to the occurencies count.\n\n"+
    "Configuration:\n"+
    "The available aggregations for representation can be cycled through by clicking on the names, and \n"+
    "the order in which the values appear changed by clicking in the correspondant arrow of in the legend.";

export default BarChart;
