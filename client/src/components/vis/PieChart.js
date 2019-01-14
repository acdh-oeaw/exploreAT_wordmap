import * as d3 from 'd3';
import React from 'react';
import { Icon } from 'react-materialize';


/* Dummy
 * Dummy component for scaffolding vis components
 * Vis components are provided with width, height and data props
 *
 * Data is provided as an array of objects
 */
 const params = {
    legendWidth: 200,
    marginTop: 25, // for the selection of 
    marginRight: 10, // because of the padding of the container
    paddingLeft:10,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
 };

class PieChart extends React.Component{
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
            data,
            total,
            legend: attribute[attribute.aggregation_term!='none'?'aggregation_term':'name'],
            sector_dimension:attribute.name,
            selected_attribute: attribute,
            sortBy: 'key',
            keySortOrder:'up',
            valueSortOrder:'up',
            sortingFunction: this.sortingFunctions['key']['up'],
        };


        this.node = d3.select(this.node);
        this.createSectors = this.createSectors.bind(this);
        this.selectAttribute = this.selectAttribute.bind(this);
        this.highlightEntities = this.highlightEntities.bind(this);
        this.unhighlightEntities = this.unhighlightEntities.bind(this);
        this.setSortBy = this.setSortBy.bind(this);
        this.stripUri = (value)=>String(value).includes('/')?value.split('/')[value.split('/').length-1]:value;
        this.sanitizeClassName = (name)=>(name.replace(/"/g,'').replace(/\./g,'').replace(/ /g, ''));
    }
    
    componentDidMount(){
        const attribute = this.props.attributes[0]
        this.setState({
            legend:attribute[attribute.aggregation_term!='none'?'aggregation_term':'name'],
            data:attribute.data, 
            sector_dimension:attribute.name, 
            total:attribute.data_total
        });
    }

    componentWillUnmount(){
    }

    componentWillUpdate(nextProps, nextState){
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

    createSectors(dimensions){
        const polarToCartesian = (centerX, centerY, radius, angleInDegrees)=>{
            var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

            return {
                x: centerX + (radius * Math.cos(angleInRadians)),
                y: centerY + (radius * Math.sin(angleInRadians))
            };
        }

        const describeArc = (x, y, radius, startAngle, endAngle) =>{

            var start = polarToCartesian(x, y, radius, endAngle);
            var end = polarToCartesian(x, y, radius, startAngle);

            var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

            var d = [
                "M", start.x, start.y, 
                "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
            ].join(" ");

            return d;       
        }

        let rotationAccumulated = 0;
        const colorScale = d3.scaleOrdinal( d3.schemeSet3);
        const last_field_of_uri = (uri)=>uri.includes('/')?uri.split('/')[uri.split('/').length-1]:uri;

        const sectors = d3.entries(this.state.data).sort(this.state.sortingFunction).map((d,i)=>{
            // classValue is the stripped identifyer to be used for the class name
            // shortter names will yield faster search results
            let classValue = last_field_of_uri(String(d.key.valueOf()));
            const className = `${this.state.legend}-${classValue}`;

            const endAngle = rotationAccumulated + (360/this.state.total)*d.value;
            let path = describeArc(dimensions.x, dimensions.y, dimensions.radius, 0.1+rotationAccumulated, endAngle-0.1);
            path +=` L${dimensions.x},${dimensions.y}Z`
            const sector = (<path
                className={className}
                d={path}
                fill={this.props.colorScales[this.state.legend](this.sanitizeClassName( this.stripUri( d.key)))} 
                onMouseEnter={()=>this.highlightEntities(className)}
                onMouseOut={()=>this.unhighlightEntities()}
                onClick={()=>{
                    this.props.filters[this.state.selected_attribute.aggregation_term].filter(d.key);
                    this.props.updateFilteredData();
                }}
                ></path>);
            rotationAccumulated = endAngle;
            return(<g key={d.key}>
                {sector}
                <title>{d.key} ( {d.value} , {Math.trunc(d.value*100/this.state.total)}%)</title>
            </g>);
        });

        return sectors;
    }

    highlightEntities(selector){
        d3.selectAll('.'+selector).classed('hovered',true);
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
        const last_field_of_uri = (uri)=>uri.includes('/')?uri.split('/')[uri.split('/').length-1]:uri;

        const size = {
            x: params.paddingLeft + (this.props.width - params.marginRight-params.paddingLeft-params.paddingRight - params.legendWidth)/2,
            y: params.marginTop-params.paddingTop+(this.props.height - params.marginTop-params.paddingTop-params.paddingBottom)/2,
            width: (this.props.width - params.marginRight),
            height: (this.props.height - params.marginTop),
            radius: Math.min((this.props.height - params.marginTop-params.paddingTop-params.paddingBottom), 
                    (this.props.width - params.marginRight-params.paddingLeft-params.paddingRight - params.legendWidth))/2
        }

        const style = (e)=>this.state.sector_dimension==e?{cursor:"pointer",color:"#18bc9c", marginLeft:"5px"}:
        {cursor:"pointer",color:"black", marginLeft:"5px"};

        return(
            <div id="PieChart" className="visualization" style={{height:this.props.height+'px', width:this.props.width+'px'}} ref={node => this.domElement = node}>
                <p style={{margin:0}}>Select the attribute used for the sectors : {this.props.attributes.map(e=>(
                    <span key={e.name} onClick={()=>this.selectAttribute(e)} className="option" style={style(e.name)}> {e.name} </span>
                ))}</p>
                <svg style={{width:size.width+'px', height:size.height+'px'}}>
                    <g>
                        <circle 
                            cx={size.x} 
                            cy={size.y} 
                            r={size.radius}
                            fill="lightgrey"> 

                        </circle>
                        {this.createSectors(size)}
                    </g>
                   <g className="legend" transform={`translate(${this.props.width - params.legendWidth },30)`}>
                        <g transform={`translate(0,0)`}>
                            <text x="7" y="0">
                                {this.state.legend}
                                <tspan onClick={()=>this.setSortBy("key")} className={"sortBy"}> 
                                    {(this.state.keySortOrder == 'up')?"⯆":"⯅"}
                                </tspan>
                                ( value 
                                <tspan onClick={()=>this.setSortBy("value")} className={"sortBy"}> 
                                    {(this.state.valueSortOrder == 'up')?"⯆":"⯅"}
                                </tspan>
                                )
                            </text>
                        </g>
                        {(()=>{
                            let legend = "";
                            if(this.state.data != null){
                                const colorScale = d3.scaleOrdinal( d3.schemeSet3);
                                legend = d3.entries(this.state.data).sort(this.state.sortingFunction).map((d,i)=>(
                                    (55 + i*16 > this.props.height-params.marginTop - params.paddingBottom)?'':
                                    <g transform={`translate(0,${17 + i*16})`} 
                                            key={d.key}
                                            className={`${this.state.legend}-${last_field_of_uri(String(d.key))}`}
                                            onMouseEnter={()=>this.highlightEntities(`${this.state.legend}-${last_field_of_uri(String(d.key))}`)}
                                            onMouseOut={()=>this.unhighlightEntities()}
                                            onClick={()=>{
                                                this.props.filters[this.state.selected_attribute.aggregation_term].filter(d.key);
                                                this.props.updateFilteredData();
                                            }}>
                                        <circle cx="0" cy="0" r="6" fill={
                                            this.props.colorScales[this.state.legend](
                                                this.sanitizeClassName( 
                                                    this.stripUri( d.key)))}></circle>
                                        <text x="7" y="5">
                                            {d.key.includes('/')?d.key.split('/')[d.key.split('/').length-1]:d.key} ( {d.value} )
                                        </text>
                                    </g>
                                ));
                            }
                            return(legend);
                        })()}
                        {(d3.entries(this.state.data).length*16 + 55 <
                          this.props.height-params.marginTop - params.paddingBottom)?'':
                            <g transform={`translate(0,${this.props.height-params.marginTop - params.paddingBottom - 45})`}>
                                <text x="7" y="15"> . . . </text>
                            </g>
                        }
                    </g>
                </svg>
            </div>
        );
    }
}

export default PieChart;
