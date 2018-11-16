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
            data: {valor1: 23, valor2: 24, valor3: 15},
            total: 62
        };

        this.node = d3.select(this.node);
        this.createSectors = this.createSectors.bind(this);
    }

    componentDidMount(){
    }

    componentWillUnmount(){
    }

    componentWillUpdate(nextProps, nextState){
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
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
                key={d.key}
                d={path}
                fill={colorScale(i)}
                ></path>);
            rotationAccumulated = endAngle;
            return(sector);
        });

        return sectors;
    }

    render(){
        const size = {
            width: this.props.width+"px",
            height: (this.props.height)+"px"
        }

        const chartDimensions = {
            width: this.props.width,
            height: (this.props.height - 50),
            radius: Math.min((this.props.height - 100), this.props.width)/2
        }

        return(
            <div id="PieChart" className="visualization" style={size} ref={node => this.domElement = node}>
                <p style={{margin:0}}>Table for {this.props.entities.map(e=>(<span key={e}>{e}</span>))} {this.props.height}</p>
                <svg style={{width:chartDimensions.width+'px', height:(chartDimensions.height+'px')}}>
                    <g>
                        <circle 
                            cx={chartDimensions.width/2} 
                            cy={chartDimensions.height/2} 
                            r={chartDimensions.radius}
                            fill="lightgrey">

                        </circle>
                        {this.createSectors(chartDimensions)}
                    </g>
                </svg>
            </div>
        );
    }
}

export default PieChart;
