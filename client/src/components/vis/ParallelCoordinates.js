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
    legendWidth: 200,
    marginTop: 30, // for the selection of 
    marginRight: 30, // because of the padding of the container
    paddingLeft:60,
    paddingTop: 8,
    paddingRight: 28,
    paddingBottom: 28,
 };

class ParallelCoordinates extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            colorAttribute: this.props.attributes[0].name
        };

        this.data = [];
        for(let i=0; i<this.props.attributes[0].data_total; i++){
            let entry = {};
            this.props.attributes.map(attr=>{
                // The uris are shrotten 
                let value = attr.data[attr.name][i].valueOf();
                    value = value.includes('/')?value.split('/')[value.split('/').length-1]:value
                entry[attr.name] = value;
            })
            this.data.push(entry);
        }

        this.node = d3.select(this.node);
        this.lineGenerator = d3.line();
        
        //Helper functions

        this.xScale = d3.scalePoint()
          .domain(this.props.attributes.map(x=>x.name))
          .range([params.paddingLeft, this.props.width-params.paddingRight-params.legendWidth-params.marginRight]);
        
        this.yScales = {};
        this.props.attributes.map(x=>{
            const attribute_values = [];
                x.data[x.name].map(e=>{
                    let value = e.valueOf();
                        value = value.includes('/')?value.split('/')[value.split('/').length-1]:value;
                    if(!attribute_values.includes(value))
                        attribute_values.push(value);
                });
            this.yScales[x.name] = d3.scalePoint()
                .domain(attribute_values)
                .range([this.props.height-params.marginTop -params.paddingBottom, params.paddingTop + params.marginTop+20]);
            });

        this.yAxis = {};
        d3.entries(this.yScales).map(x=>{
            this.yAxis[x.key] = d3.axisLeft(x.value);
        });

        this.colorScale = d3.scaleOrdinal( d3.schemeSet3)
            .domain(this.yScales[this.props.attributes[0].name].domain());
        //Binding of class methods
        
        this.linePath = this.linePath.bind(this);
        this.renderParallelCoordinates = this.renderParallelCoordinates.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.updateScales = this.updateScales.bind(this);
        this.repositionScales = this.repositionScales.bind(this);
        this.updateColorAttribute = this.updateColorAttribute.bind(this);
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
            .attr('stroke',(d,i)=>this.colorScale(d[this.state.colorAttribute]));

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
          .attr('y', params.paddingTop+ params.marginTop + 10)
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
            .attr('stroke',(d,i)=>this.colorScale(d[this.state.colorAttribute]));
    }

    updateScales(){
        this.xScale = d3.scalePoint()
          .domain(this.props.attributes.map(x=>x.name))
          .range([params.paddingLeft, this.props.width-params.paddingRight-params.legendWidth - params.marginRight]);
        
        this.yScales = {};
        this.props.attributes.map(x=>{
            const attribute_values = [];
                x.data[x.name].map(e=>{
                    let value = e.valueOf();
                        value = value.includes('/')?value.split('/')[value.split('/').length-1]:value;
                    if(!attribute_values.includes(value))
                        attribute_values.push(value);
                });
            this.yScales[x.name] = d3.scalePoint()
                .domain(attribute_values)
                .range([this.props.height-params.marginTop - params.paddingBottom, params.paddingTop + params.marginTop +20]);
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
          .attr('y', params.paddingTop+ params.marginTop + 10)
          .attr('x', -20)
          .text(d=>d.name);
      }

    updateColorAttribute(attribute){
        this.colorScale = d3.scaleOrdinal( d3.schemeSet3)
            .domain(this.yScales[attribute].domain())

        d3.select(this.active).selectAll('path')
            .attr('stroke',(d,i)=>this.colorScale(d[attribute]));
        this.setState({colorAttribute: attribute})
    }

    render(){
        const size = {
            width: this.props.width+"px",
            height: (this.props.height)+"px"
        }

        const style = (e)=>this.state.colorAttribute==e?{cursor:"pointer",color:"#18bc9c", marginLeft:"5px"}:
        {cursor:"pointer",color:"black", marginLeft:"5px"};

        return(
            <div id="ParallelCoordinates" className="visualization" style={size} ref={node => this.domElement = node}>
                <p style={{margin:0}}>Select the variable used for coloring : {this.props.attributes.map(e=>(
                    <span key={e.name} onClick={()=>this.updateColorAttribute(e.name)} className="option" style={style(e.name)}> {e.name} </span>
                ))}</p>
                <svg ref={node => this.svg = node} 
                width={this.props.width - params.marginRight}
                height={this.props.height - params.marginTop}>
                    <g ref={node => this.inactive = node} className={'inactive'}/>
                    <g ref={node => this.active = node} className={'active'}/>
                    <g className="legend" transform={`translate(${this.props.width - params.legendWidth },30)`}>
                        <g transform={`translate(0,0)`}>
                            <text x="7" y="0">
                                {this.state.colorAttribute}
                            </text>
                        </g>
                        {this.colorScale.domain().map((d,i)=>(
                            (45 + i*16 > this.props.height-params.marginTop - params.paddingBottom)?'':
                            <g transform={`translate(0,${17 + i*16})`} key={'legend-'+i}>
                                <circle cx="0" cy="0" r="6" fill={this.colorScale(d)}></circle>
                                <text x="7" y="5">
                                    {d}
                                </text>
                            </g>
                        ))}
                        {(this.colorScale.domain().length*16 + 47 <
                          this.props.height-params.marginTop - params.paddingBottom)?'':
                            <g transform={`translate(0,${this.props.height-params.marginTop - params.paddingBottom - 35})`}>
                                <text x="7" y="15"> . . . </text>
                            </g>
                        }
                    </g>
                </svg>
            </div>
        );
    }
}

export default ParallelCoordinates;
