import * as d3 from 'd3';
import React from 'react';

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

        this.state = {
            legend: this.props.attributes[0][this.props.attributes[0].aggregation_term!='none'?'aggregation_term':'name'],
            sector_dimension:this.props.attributes[0].name,
            data: this.props.attributes[0].data,
            total: this.props.attributes[0].total
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
        this.setState({
            legend:attribute[attribute.aggregation_term!='none'?'aggregation_term':'name'],
            data:attribute.data, 
            sector_dimension:attribute.name, 
            total:attribute.data_total})
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

        const sectors = d3.entries(this.state.data).map((d,i)=>{
            const endAngle = rotationAccumulated + (360/this.state.total)*d.value;
            let path = describeArc(dimensions.x, dimensions.y, dimensions.radius, rotationAccumulated, endAngle);
            path +=` L${dimensions.x},${dimensions.y}`
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
            x: params.paddingLeft + (this.props.width - params.marginRight-params.paddingLeft-params.paddingRight - params.legendWidth)/2,
            y: params.marginTop-params.paddingTop+(this.props.height - params.marginTop-params.paddingTop-params.paddingBottom)/2,
            width: (this.props.width - params.marginRight),
            height: (this.props.height - params.marginTop),
            radius: Math.min((this.props.height - params.marginTop-params.paddingTop-params.paddingBottom), 
                    (this.props.width - params.marginRight-params.paddingLeft-params.paddingRight - params.legendWidth))/2
        }

        console.log(size)

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
                    <g transform={`translate(${this.props.width - params.legendWidth },30)`}>
                        <g transform={`translate(0,0)`}>
                            <text x="7" y="5">
                                {this.state.legend} ( value )
                            </text>
                        </g>
                        {(()=>{
                            const colorScale = d3.scaleOrdinal( d3.schemeSet3);
                            const legend = d3.entries(this.state.data).map((d,i)=>(
                                <g transform={`translate(0,${17 + i*16})`} key={d.key}>
                                    <circle cx="0" cy="0" r="6" fill={colorScale(i)}></circle>
                                    <text x="7" y="5">
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
