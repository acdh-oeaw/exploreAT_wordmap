import * as d3 from 'd3';
import React from 'react';
import d3tip from 'd3-tip';
import Select from 'react-select';
import SearchField from 'react-search-field';
import { schemeSet1 } from 'd3-scale-chromatic';
import * as legend from 'd3-svg-legend';

/* PackedBubbles
 * Dummy component for scaffolding vis components
 * Vis components are provided with width, height and data props
 *
 * Data is provided as an array of objects
 */

class PackedBubbles extends React.Component{
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
            <div id="PackedBubbles" className="visualization" style={size} ref={node => this.domElement = node}>
                <p style={{margin:0}}>Dummy component for {this.props.entities.map(e=>(<span key={e}>{e}</span>))} {this.props.height}</p>
            </div>
        );
    }
}

export default PackedBubbles;
