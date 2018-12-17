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
            end: 100,
        };

        this.columnNames = this.props.attributes.map(x=>x.name);
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
        let data = [];

        if(this.props.attributes.some(a=>a.aggregation!='none')){
            let aggregations = {};
            this.props.attributes.map(a=>aggregations[a.name]={})

            this.props.data.map(d=>{
                this.props.attributes.map(a=>{
                    if(aggregations[a.name][d[a.aggregation_term]] && aggregations[a.name][d[a.aggregation_term]].length>0){
                        if(!aggregations[a.name][d[a.aggregation_term]].includes(d[a.attribute]))
                            aggregations[a.name][d[a.aggregation_term]].push(d[a.attribute])
                    }
                    else{
                        aggregations[a.name][d[a.aggregation_term]] = [d[a.attribute],]
                    }
                })
            })                
            
            const cols = d3.keys(aggregations);
            const entities = d3.keys(aggregations[cols[0]]);
            const aggregation_term = this.props.attributes[0].aggregation_term;

            data = entities.map(e=>{
                const entry = {};
                entry[aggregation_term]= e
                cols.map(col=>entry[col]=aggregations[col][e].length);
                return entry;
            });
            this.columnNames = d3.keys(data[0])

        }else{
            data = this.props.data;
        }

        for(let i=begin; i<end && i<data.length; i++){
            const d = data[i];
            const df = [];
            

            if(this.props.attributes[0].aggregation=='none'){
                this.props.attributes.map(e=>{
                    df.push(<td key={e.attribute+i}>{d[e.attribute].valueOf()}</td>);
                });
            }
            else{
                d3.keys(d).map(e=>{
                    df.push(<td key={e+i}>{d[e].valueOf()}</td>);
                });
            }

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
        this.columnNames.map(e=>{
            header.push(<th key={e}>{e}</th>);
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
                    <span>{ this.state.begin } - { (this.props.attributes[0].unique < this.state.end)?(this.props.attributes[0].unique - this.state.begin):this.state.end } </span>
                    <span> / { this.props.attributes[0].unique } |  </span>  
                    <span> { (this.state.begin > 0)?(<a onClick={()=>this.prevPage()}> prev page </a>):"  prev page  " } </span>
                    <span> { (this.props.attributes[0].unique > this.state.end)?(<a onClick={()=>this.nextPage()}> next page </a>):"  next page " } </span>
                </p>
                <table>
                    {this.renderHeader()}
                    {this.renderCells(this.state.begin, this.state.end)}
                </table>
                <p>
                    <span>{ this.state.begin } - { (this.props.attributes[0].unique < this.state.end)?(this.props.attributes[0].unique - this.state.begin):this.state.end } </span>
                    <span> / { this.props.attributes[0].unique } |  </span>  
                    <span> { (this.state.begin > 0)?(<a onClick={()=>this.prevPage()}> prev page </a>):"  prev page  " } </span>
                    <span> { (this.props.attributes[0].unique > this.state.end)?(<a onClick={()=>this.nextPage()}> next page </a>):"  next page " } </span>
                </p>
            </div>
        );
    }
}

export default Table;
