import * as d3 from 'd3';
import React from 'react';

/* Dummy
 * Draws a hull showing the area occupied by each of the groups.
 * Color of the stroke and area corresponds to each of the teams.
 * Represents the evolution of the area occupied through a line chart.
 */

class Dummy extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            
        };

        this.analysisG = d3.select(this.domElement);
    }

    componentDidMount(){
    }

    componentWillUnmount(){
    }

    componentWillUpdate(nextProps, nextState){
    }

    render(){
        const size = {
            width: this.props.width+"px",
            height: (this.props.height)+"px"
        }
        return(
            <div id="Dummy" className="visualization" style={size}>
                <p style={{margin:0}}>Dummy component for {this.props.entities.map(e=>(<span key={e}>{e}</span>))} {this.props.height}</p>
            </div>
        );
    }
}

export default Dummy;
