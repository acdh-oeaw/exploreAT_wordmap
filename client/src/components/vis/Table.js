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
                <tbody>
                    <tr>
                        {this.props.entities.map((e,i)=>(<th key={i}>{e}</th>))}
                    </tr>
                </tbody>
                {this.props.data.map((e,i)=>(<tr key={"r"+i}>{this.props.entities.map(entity=>(<td key={entity+i}>{e[entity].toString()}</td>))}</tr>))}
                </table>
            </div>
        );
    }
}

export default Table;
