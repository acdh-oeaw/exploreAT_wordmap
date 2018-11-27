import * as d3 from 'd3';
import React from 'react';

/* Dummy
 * Dummy component for scaffolding vis components
 * Vis components are provided with width, height and data props
 *
 * Data is provided as an array of objects
 */

class Dummy extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            
        };

        this.node = d3.select(this.node);
    }

    componentDidMount(){
    }

    componentWillUnmount(){
    }

    componentWillUpdate(nextProps, nextState){
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    render(){
        const size = {
            width: this.props.width+"px",
            height: (this.props.height)+"px"
        }
        console.log(this.props)
        return(
            <div id="Dummy" className="visualization" style={size} ref={node => this.domElement = node}>
                <p style={{margin:0}}>Dummy component for {this.props.entities.map(e=>(<span key={e}>{e}</span>))} {this.props.height}</p>
            </div>
        );
    }
}

export default Dummy;
