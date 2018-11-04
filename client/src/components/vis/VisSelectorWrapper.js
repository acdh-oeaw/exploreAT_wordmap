import * as d3 from 'd3';
import React from 'react';

/* VisSelectorWrapper
 * Provides funcionality for editing, deleting and exporting visualizations
 * Helps with abstraction of grid layout management
 * Represents the evolution of the area occupied through a line chart.
 */

class VisSelectorWrapper extends React.Component{
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
            <div className="visWrapper" width={this.props.width-20} height={this.props.height}>
                <div className="header">
                    <p>{this.props.name}</p>
                </div>
                <div className="content">
                    {childrenWithProps}
                </div>
            </div>
        );
    }
}

export default VisSelectorWrapper;