import * as d3 from 'd3';
import React from 'react';

/* BarChart
 * BarChart component to show aggregated data
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

class BarChart extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            legend: this.props.attributes[0][this.props.attributes[0].aggregation_term!='none'?'aggregation_term':'name'],
            sector_dimension:this.props.attributes[0].name,
            data: this.props.attributes[0].data,
            total: this.props.attributes[0].total
        };

        this.node = d3.select(this.node);
        this.createBars = this.createBars.bind(this);
        this.selectAttribute = this.selectAttribute.bind(this);
    }

    componentDidMount(){
    }

    componentWillUnmount(){
    }

    componentWillUpdate(nextProps, nextState){
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    selectAttribute(attribute){
        this.setState({
            legend: attribute[attribute.aggregation_term!='none'?'aggregation_term':'name'],
            data:attribute.data, 
            sector_dimension:attribute.name, 
            total:attribute.data_total})
    }

    createBars(dimensions){
        let rotationAccumulated = 0;
        const colorScale = d3.scaleOrdinal( d3.schemeSet3);
        const yScale = d3.scaleLinear()
            .domain([0,d3.values(this.state.data).reduce((a,b)=>a>b?a:b,0)])
            .range([params.paddingTop,dimensions.height-params.paddingBottom]);
        const bar_width = (dimensions.width)/d3.keys(this.state.data).length;

        const bars = d3.entries(this.state.data).map((d,i)=>{
            const bar = (<rect fill={colorScale(i)} 
                x={0}
                y={0}
                width={bar_width-2}
                height={yScale(d.value)}></rect>);
            
            return(<g key={d.key} transform={`translate(${params.paddingLeft + i*bar_width},${dimensions.height - yScale(d.value)})`}> 
                {bar}
                <text x={2+ bar_width/2} y={15} className="barValue">{d.value}</text>
                <title>{d.key} - {d.value}</title>
            </g>);
        });

        return bars;
    }

    render(){
        const size = {
            width: (this.props.width - params.marginRight),
            height: (this.props.height - params.marginTop),
        }

        const chartDimensions = {
            width: (this.props.width - params.marginRight - params.paddingRight - params.paddingLeft - params.legendWidth),
            height: (this.props.height - params.marginTop - params.paddingTop - params.paddingBottom),   
        }

        const style = (e)=>this.state.sector_dimension==e?{cursor:"pointer",color:"#18bc9c", marginLeft:"5px"}:
        {cursor:"pointer",color:"black", marginLeft:"5px"};

        return(
            <div id="BarChart" className="visualization" style={{height:this.props.height+'px', width:this.props.width+'px'}} ref={node => this.domElement = node}>
                <p style={{margin:'0 10px'}}>Select the attribute used for the bars : {this.props.attributes.map(e=>(
                    <span key={e.name} onClick={()=>this.selectAttribute(e)} className="option" style={style(e.name)}> {e.name} </span>
                ))}</p>
                <svg style={size}>
                    <g id="bars">
                        {this.state.data!=null?this.createBars(chartDimensions):""}
                    </g>
                    <g transform={`translate(${this.props.width - params.legendWidth },30)`}>
                        <g transform={`translate(0,0)`}>
                            <text x="7" y="0">
                                {this.state.legend} ( value )
                            </text>
                        </g>
                        {(()=>{
                            let legend = "";
                            if(this.state.data != null){
                                const colorScale = d3.scaleOrdinal( d3.schemeSet3);
                                legend = d3.entries(this.state.data).map((d,i)=>(
                                    (55 + i*16 > this.props.height-params.marginTop - params.paddingBottom)?'':
                                    <g transform={`translate(0,${17 + i*16})`} key={d.key}>
                                        <circle cx="0" cy="0" r="6" fill={colorScale(i)}></circle>
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

export default BarChart;
