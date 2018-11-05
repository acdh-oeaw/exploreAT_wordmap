import * as d3 from 'd3';
import React from 'react';

/* Table
 * Table containing data retrieved.
 */

class Table extends React.Component{
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
            <div id="Table" className="visualization" style={size}>
                <table>
                <tr>
                    {this.props.entities.map(e=>(<th key={e}>{e}</th>))}
                </tr>
                {this.props.data.map(e=>(<tr key={"r"+e}>{this.props.entities.map(entity=>(<td key={e+entity}>{e[entity].toString()}</td>))}</tr>))}
                </table>
            </div>
        );
    }
}

export default Table;
