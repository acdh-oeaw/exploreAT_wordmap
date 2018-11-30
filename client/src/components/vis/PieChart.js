import * as d3 from 'd3';
import React from 'react';

/* Dummy
 * Dummy component for scaffolding vis components
 * Vis components are provided with width, height and data props
 *
 * Data is provided as an array of objects
 */

class PieChart extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            sector_dimension:"",
            data: {'_': 1},
            total: 1
        };

        this.node = d3.select(this.node);
        this.createSectors = this.createSectors.bind(this);
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
        const colorScale = d3.scaleOrdinal( d3.schemeSet1);

        const sectors = d3.entries(this.state.data).map((d,i)=>{
            const endAngle = rotationAccumulated + (360/this.state.total)*d.value;
            let path = describeArc(dimensions.width/2, dimensions.height/2, dimensions.radius, rotationAccumulated, endAngle);
            path +=` L${dimensions.width/2},${dimensions.height/2}`
            const sector = (<path
                d={path}
                fill={colorScale(i)}
                ></path>);
            rotationAccumulated = endAngle;
            return(<g key={d.key}>
                {sector}
                <title>{d.key} ( {d.value} , {Math.trunc(d.value*100/this.state.total)}%)</title>
            </g>);
        });

        return sectors;
    }

    render(){
        const size = {
            width: this.props.width+"px",
            height: (this.props.height)+"px"
        }

        const chartDimensions = {
            width: (this.props.width * 0.8),
            height: (this.props.height - 50),
            radius: Math.min((this.props.height - 100), this.props.width)/2
        }

        const style = (e)=>this.state.sector_dimension==e?{cursor:"pointer",color:"#18bc9c", marginLeft:"5px"}:
        {cursor:"pointer",color:"black", marginLeft:"5px"};

        return(
            <div id="PieChart" className="visualization" style={size} ref={node => this.domElement = node}>
                <p style={{margin:0}}>Select the attribute used for the sectors : {this.props.attributes.map(e=>(
                    <span key={e.name} onClick={()=>this.selectAttribute(e)} className="option" style={style(e.name)}> {e.name} </span>
                ))}</p>
                <svg style={{width:size.width, height:(chartDimensions.height+'px')}}>
                    <g>
                        <circle 
                            cx={chartDimensions.width/2} 
                            cy={chartDimensions.height/2} 
                            r={chartDimensions.radius}
                            fill="lightgrey"> 

                        </circle>
                        {this.createSectors(chartDimensions)}
                    </g>
                    <g transform={`translate(${chartDimensions.width/2 + chartDimensions.radius + 20 },${30})`}>
                        {(()=>{
                            const colorScale = d3.scaleOrdinal( d3.schemeSet1);
                            const legend = d3.entries(this.state.data).map((d,i)=>(
                                <g transform={`translate(0,${i*15})`} key={d.key}>
                                    <circle cx="0" cy="0" r="6" fill={colorScale(i)}></circle>
                                    <text x="5" y="5">
                                        {d.key.includes('/')?d.key.split('/')[d.key.split('/').length-1]:d.key} ( {d.value} )
                                    </text>
                                </g>
                            ));
                            return(legend);
                        })()}
                    </g>
                </svg>
            </div>
        );
    }
}

export default PieChart;
