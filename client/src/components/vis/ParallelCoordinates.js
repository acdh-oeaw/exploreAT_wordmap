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
    legendWidth: 250,
    paddingLeft:60,
    paddingTop: 28,
    paddingRight: 28,
    paddingBottom: 28,
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
        this.colorScale = d3.scaleOrdinal( d3.schemeSet1);

        this.xScale = d3.scalePoint()
          .domain(this.props.attributes.map(x=>x.name))
          .range([params.paddingLeft, this.props.width-params.paddingRight-params.legendWidth]);
        
        this.yScales = {};
        this.props.attributes.map(x=>{
            const attribute_values = [];
                x.data[x.name].map(e=>{
                    if(!attribute_values.includes(e.valueOf()))
                        attribute_values.push(e.valueOf());
                });
            this.yScales[x.name] = d3.scalePoint()
                .domain(attribute_values)
                .range([this.props.height-params.paddingBottom, params.paddingTop+20]);
            });

        this.yAxis = {};
        d3.entries(this.yScales).map(x=>{
            this.yAxis[x.key] = d3.axisLeft(x.value);
        });

        //Binding of class methods
        
        this.linePath = this.linePath.bind(this);
        this.renderParallelCoordinates = this.renderParallelCoordinates.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.updateScales = this.updateScales.bind(this);
        this.repositionScales = this.repositionScales.bind(this);
    }

    componentDidMount(){
        this.renderParallelCoordinates();
    this.setState({did_mount : true});
    }

    componentWillUnmount(){
    }

    componentWillUpdate(nextProps, nextState){
    }

    componentDidUpdate(prevProps, prevState, snapshot){
      if(this.state.did_mount == true){
        this.updateScales();
        if(prevProps.width != this.props.width || prevProps.height != this.props.height){
            this.repositionScales();
        }
        this.updateParallelCoordinates();
      }
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
            .attr('stroke',(d,i)=>this.colorScale(i));

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
          .attr('y', params.padding+10)
          .attr('x', -20)
          .text(d=>d.name);
    }

    updateParallelCoordinates(){
        // active data
        let active = d3.select(this.active).selectAll('path')
          .data(this.data)
        active.exit().remove();
        active.enter().append('path');

        active
            .attr('d', d=>this.linePath(d))
            .attr('stroke',(d,i)=>this.colorScale(i));
    }

    updateScales(){
        this.xScale = d3.scalePoint()
          .domain(this.props.attributes.map(x=>x.name))
          .range([params.paddingLeft, this.props.width-params.paddingRight-params.legendWidth]);
        
        this.yScales = {};
        this.props.attributes.map(x=>{
            const attribute_values = [];
                x.data[x.name].map(e=>{
                    if(!attribute_values.includes(e.valueOf()))
                        attribute_values.push(e.valueOf());
                });
            this.yScales[x.name] = d3.scalePoint()
                .domain(attribute_values)
                .range([this.props.height-params.paddingBottom, params.paddingTop+20]);
            });

        this.yAxis = {};
        d3.entries(this.yScales).map(x=>{
            this.yAxis[x.key] = d3.axisLeft(x.value);
        });    
    }

    repositionScales(){
        const pcSvg = d3.select(this.svg)
        d3.selectAll('g.feature') 
            .remove();
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
          .attr('y', params.paddingTop+10)
          .attr('x', -20)
          .text(d=>d.name);
      }

    render(){
        const size = {
            width: this.props.width+"px",
            height: (this.props.height)+"px"
        }

        return(
            <div id="ParallelCoordinates" className="visualization" style={size} ref={node => this.domElement = node}>
                <svg ref={node => this.svg = node} 
                width={this.props.width - params.legendWidth}
                height={this.props.height}>
                    <g ref={node => this.inactive = node} className={'inactive'}/>
                    <g ref={node => this.active = node} className={'active'}/>
                </svg>
            </div>
        );
    }
}

export default ParallelCoordinates;
