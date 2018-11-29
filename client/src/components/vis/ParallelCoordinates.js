import * as d3 from 'd3';
import React from 'react';

/* ParallelCoordinates
 * Parallel Coordinates component for scaffolding vis components
 * Vis components are provided with width, height and data props
 *
 * Data is provided as an array of objects
 */

class ParallelCoordinates extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            variables: [],
            total: 1
        };

        this.node = d3.select(this.node);
        this.toggleVariables = this.toggleVariables.bind(this);
    }

    componentDidMount(){
    }

    componentWillUnmount(){
    }

    componentWillUpdate(nextProps, nextState){
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    toggleVariables(variable){
        if(variable)
            if(this.state.variables.map(d=>d.name).includes(variable.name))
                this.setState(prev=>{
                    prev.variables = prev.variables.filter(d=>d.name!=variable.name);
                    return(prev);
                })    
            else
                this.setState(prev=>{
                    prev.variables.push(variable);
                    return(prev);
                })
    }

    render(){
        const size = {
            width: this.props.width+"px",
            height: (this.props.height)+"px"
        }

        const current_variables = this.state.variables.map(d=>d.name);
        const style = (variable)=>(current_variables.includes(variable))?{cursor:"pointer",color:"#18bc9c", marginLeft:"5px"}:
        {cursor:"pointer",color:"black", marginLeft:"5px"};

        return(
            <div id="ParallelCoordinates" className="visualization" style={size} ref={node => this.domElement = node}>
                <p style={{margin:0}}>Add variables to the parallel coordinates : {this.props.attributes.map(e=>(
                    <span key={e.name} onClick={()=>this.toggleVariables(e)} className="option" style={style(e.name)}> {e.name} </span>
                ))}</p>

                <svg ref={node => this.svg = node} 
                width={this.props.width}
                height={this.props.height}>
                    <g ref={node => this.inactive = node} className={'inactive'}/>
                    <g ref={node => this.active = node} className={'active'}/>
                </svg>
            </div>
        );
    }
}

export default ParallelCoordinates;
