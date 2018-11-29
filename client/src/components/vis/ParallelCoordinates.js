import * as d3 from 'd3';
import React from 'react';

/* ParallelCoordinates
 * Parallel Coordinates component for scaffolding vis components
 * Vis components are provided with width, height and data props
 *
 * Data is provided as an array of objects
 */
 const params = {
    brush_width: 20,
    padding:28
 };

class ParallelCoordinates extends React.Component{
    constructor(props){
        super(props);

        this.state = {};

        this.data = [];
        for(let i=0; i<this.props.attributes[0].data_total; i++){
            let entry = {};
            this.props.attributes.map(attr=>{
                entry[attr.name] = attr.data[attr.name][i].valueOf();
            })
            this.data.push(entry);
        }

        this.node = d3.select(this.node);
        this.lineGenerator = d3.line();
        
        //Helper functions
        this.xScale = d3.scalePoint()
          .domain(this.props.attributes.map(x=>x.name))
          .range([params.padding, this.props.width-params.padding]);
        
        this.yScales = {};
        this.props.attributes.map(x=>{
            const attribute_values = [];
                x.data[x.name].map(e=>{
                    if(!attribute_values.includes(e.valueOf()))
                        attribute_values.push(e.valueOf());
                });
            this.yScales[x.name] = d3.scalePoint()
                .domain(attribute_values)
                .range([this.props.height-params.padding, params.padding+20]);
            });

        this.yAxis = {};
        d3.entries(this.yScales).map(x=>{
            this.yAxis[x.key] = d3.axisLeft(x.value);
        });

        //Binding of class methods
        
        this.linePath = this.linePath.bind(this);
        this.renderParallelCoordinates = this.renderParallelCoordinates.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        //this.updateScales = this.updateScales.bind(this);
    }

    componentDidMount(){
        this.renderParallelCoordinates();
    this.setState({did_mount : true});
    }

    componentWillUnmount(){
    }

    componentWillUpdate(nextProps, nextState){
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    linePath(d){
        const _data = d3.entries(d);
        let points = _data.map(x=>([this.xScale(x.key),this.yScales[x.key](x.value)]));
        return(this.lineGenerator(points));
    }

    renderParallelCoordinates(){
        const pcSvg = d3.select(this.svg)
          .attr('width', this.props.width)
          .attr('height', this.props.height);

        // active data
        d3.select(this.active).selectAll('path')
          .data(this.data)
          .enter()
            .append('path')
            .attr('d', d=>this.linePath(d))
            .attr('stroke','black');

        // Vertical axis for the features
        const featureAxisG = pcSvg.selectAll('g.feature')
          .data(this.props.attributes)
          .enter()
            .append('g')
              .attr('class','feature')
              .attr('id',d=>d.name)
              .attr('transform',d=>('translate('+this.xScale(d.name)+',0)'));

        const yAxis = this.yAxis;
        featureAxisG
              .append('g')
              .attr('class','axis')
              .each(function(d){
                d3.select(this).call(yAxis[d.name]);
              });

        featureAxisG
          .append("text")
          .attr("transform", "rotate(-20)")
          .attr('y', this.props.padding+10)
          .attr('x', -20)
          .text(d=>d.name)
          .style('cursor', 'pointer');
      }

    render(){
        const size = {
            width: this.props.width+"px",
            height: (this.props.height)+"px"
        }

        return(
            <div id="ParallelCoordinates" className="visualization" style={size} ref={node => this.domElement = node}>
                <p style={{margin:0}}>Add variables to the parallel coordinates : {this.props.attributes.map(e=>(
                    <span key={e.name} className="option"> {e.name} </span>
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
