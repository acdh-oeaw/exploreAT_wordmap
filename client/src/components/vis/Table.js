import * as d3 from 'd3';
import React from 'react';

/* Table
 * Table containing data retrieved.
 */

class Table extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            begin: 0,
            end: 100
        };

        this.analysisG = d3.select(this.domElement);
        this.renderCells = this.renderCells.bind(this);
    }

    componentDidMount(){
    }

    componentWillUnmount(){
    }

    componentWillUpdate(nextProps, nextState){
    }

    renderCells(begin, end){
        let cells = [];

        for (var i = begin; i < end && i < this.props.attributes[0].data_length; i++) {
            const df = [];
            this.props.attributes.map(e=>{
                if(e.aggregation=='none')
                    df.push(<td key={e.attribute+i}>{e.data[e.attribute][i].valueOf()}</td>);
                else{
                    df.push(<td key={e.attribute+i}>{d3.entries(e.data)[i].key}</td>);
                    df.push(<td key={e.name+i}>{d3.entries(e.data)[i].value.valueOf()}</td>);
                }
            });
            cells.push(<tr key={i}>{df}</tr>);
        }

        return(
            <tbody>
                {cells}
            </tbody>
        );
    }

    nextPage(){
        this.setState(prev=>({begin:prev.begin+100, end:prev.end+100}))
    }

    prevPage(){
        this.setState(prev=>({begin:prev.begin-100, end:prev.end-100}))
    }

    renderHeader(){
        const header = [];
        this.props.attributes.map(e=>{
            if(e.aggregation=='none')
                header.push(<th key={e.attribute}>{e.name}</th>);
            else{
                header.push(<th key={e.attribute}>{e.attribute}</th>);
                header.push(<th key={e.name}>{e.name}</th>);
            }
        });
        return(<thead><tr>{header}</tr></thead>);
    }

    render(){
        const size = {
            width: this.props.width+"px",
            height: (this.props.height)+"px"
        }
        return(
            <div id="Table" className="visualization" style={size}>
                <p>
                    <span>{ this.state.begin } - { (this.props.attributes[0].data_length < this.state.end)?(this.props.attributes[0].data_length - this.state.begin):this.state.end } </span>
                    <span> / { this.props.attributes[0].data_length } |  </span>  
                    <span> { (this.state.begin > 0)?(<a onClick={()=>this.prevPage()}> prev page </a>):"  prev page  " } </span>
                    <span> { (this.props.attributes[0].data_length > this.state.end)?(<a onClick={()=>this.nextPage()}> next page </a>):"  next page " } </span>
                </p>
                <table>
                    {this.renderHeader()}
                    {this.renderCells(this.state.begin, this.state.end)}
                </table>
                <p>
                    <span>{ this.state.begin } - { (this.props.attributes[0].data_length < this.state.end)?(this.props.attributes[0].data_length - this.state.begin):this.state.end } </span>
                    <span> / { this.props.attributes[0].data_length } |  </span>  
                    <span> { (this.state.begin > 0)?(<a onClick={()=>this.prevPage()}> prev page </a>):"  prev page  " } </span>
                    <span> { (this.props.attributes[0].data_length > this.state.end)?(<a onClick={()=>this.nextPage()}> next page </a>):"  next page " } </span>
                </p>
            </div>
        );
    }
}

export default Table;
