import * as d3 from 'd3';
import React from 'react';

/* BarChart
 * BarChart component to show aggregated data
 * Vis components are provided with width, height and data props
 *
 * Data is provided as an array of objects
 */

class BarChart extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            sector_dimension:"",
            data: null,
            total: 1
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
        this.setState({data:attribute.data, sector_dimension:attribute.name, total:attribute.data_total})
    }

    createBars(dimensions){
        let rotationAccumulated = 0;
        const colorScale = d3.scaleOrdinal( d3.schemeSet1);
        const yScale = d3.scaleLinear()
            .domain([0,d3.values(this.state.data).reduce((a,b)=>a>b?a:b,0)])
            .range([0,dimensions.height-dimensions.margin]);
        const bar_width = (dimensions.width-dimensions.margin)/d3.keys(this.state.data).length;

        const bars = d3.entries(this.state.data).map((d,i)=>{
            const bar = (<rect fill={colorScale(i)} 
                x={0}
                y={0}
                width={bar_width-2}
                height={yScale(d.value)}></rect>);
            console.log(0,d3.values(this.state.data).reduce((a,b)=>a>b?a:b,0), dimensions.height, d.value, yScale(d.value))
            
            return(<g key={d.key} transform={`translate(${dimensions.margin + i*bar_width},${dimensions.height-dimensions.margin - yScale(d.value)})`}> 
                {bar}
                <text x={bar_width/2-5} y={25}>{d.value}</text>
                <title>{d.key} - {d.value}</title>
            </g>);
        });

        return bars;
    }

    render(){
        const size = {
            width: this.props.width+"px",
            height: (this.props.height)+"px"
        }

        const chartDimensions = {
            width: (this.props.width * 0.7),
            height: (this.props.height - 50),
            margin: 10
        }

        const style = (e)=>this.state.sector_dimension==e?{cursor:"pointer",color:"#18bc9c", marginLeft:"5px"}:
        {cursor:"pointer",color:"black", marginLeft:"5px"};

        return(
            <div id="Histogram" className="visualization" style={size} ref={node => this.domElement = node}>
                <p style={{margin:0}}>Select the attribute used for the sectors : {this.props.attributes.map(e=>(
                    <span key={e.name} onClick={()=>this.selectAttribute(e)} className="option" style={style(e.name)}> {e.name} </span>
                ))}</p>
                <svg style={{width:size.width, height:(chartDimensions.height+'px')}}>
                    <g id="bars">
                        {this.state.data!=null?this.createBars(chartDimensions):""}
                    </g>
                    <g transform={`translate(${chartDimensions.width + 20 },${30})`}>
                        {(()=>{
                            let legend = "";
                            if(this.state.data != null){
                                const colorScale = d3.scaleOrdinal( d3.schemeSet1);
                                legend = d3.entries(this.state.data).map((d,i)=>(
                                    <g transform={`translate(0,${i*15})`} key={d.key}>
                                        <circle cx="0" cy="0" r="6" fill={colorScale(i)}></circle>
                                        <text x="5" y="5">{d.key} ( {d.value} )</text>
                                    </g>
                                ));
                            }
                            return(legend);
                        })()}
                    </g>
                </svg>
            </div>
        );
    }
}

export default BarChart;
