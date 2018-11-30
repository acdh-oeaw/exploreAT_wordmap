import * as d3 from 'd3';
import React from 'react';

/* VisWrapper
 * Provides funcionality for editing, deleting and exporting visualizations
 * Helps with abstraction of grid layout management
 * Represents the evolution of the area occupied through a line chart.
 */

class VisWrapper extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            
        };

    }

    componentDidMount(){
    }

    componentWillUnmount(){
    }

    componentWillUpdate(nextProps, nextState){
    }
    /*
                        <button style={buttonStyle}
                            className="button" 
                            onClick={()=>console.log('null')}>    
                            edit
                        </button>
                        <button style={buttonStyle}
                            className="button" 
                            onClick={()=>console.log('null')}>    
                            export
                        </button>
    */

    render(){
        const buttonStyle = {
            border: 'none',
            background: 'none',
        };

        const { children } = this.props;

        const childrenWithProps = React.Children.map(children, child =>
          React.cloneElement(child, this.props)
        );

        return(
            <div className="visWrapper" width={this.props.width} height={this.props.height}>
                <div className="header">
                    <div>
                        
                    </div>
                    <p>{this.props.name}</p>
                    <button style={buttonStyle}
                        className="button" 
                        onClick={()=>this.props.removeComponent(this.props.name)}>  
                        close
                    </button>
                </div>
                <div className="content">
                    {childrenWithProps}
                </div>
            </div>
        );
    }
}

export default VisWrapper;