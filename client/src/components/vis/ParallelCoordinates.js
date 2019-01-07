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
    legendWidth: 170,
    marginTop: 30, // for the selection of 
    marginRight: 80, // because of the padding of the container
    paddingLeft:60,
    paddingTop: 8,
    paddingRight: 28,
    paddingBottom: 28,
    axisTickLength:14
 };

class ParallelCoordinates extends React.Component{
    constructor(props){
        super(props);

        const sorting = {};
        this.props.attributes.map(x=>sorting[x.name]='up');
        this.state = {
            colorAttribute: this.props.attributes[0].name,
            sorting: sorting,
            sortingChanged: false
        };

        this.updateData();
        this.updateScales();
        this.node = d3.select(this.node);
        
        //Helper functions
        this.lineGenerator = d3.line();

        //Binding of class methods
        
        this.inside = (x,feature)=>this.filters[feature][0]<=x && x <=this.filters[feature][1];
        this.linePath = this.linePath.bind(this);
        this.selected = this.selected.bind(this);
        this.renderParallelCoordinates = this.renderParallelCoordinates.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.updateScales = this.updateScales.bind(this);
        this.repositionScales = this.repositionScales.bind(this);
        this.updateColorAttribute = this.updateColorAttribute.bind(this);
        this.highlightEntities = this.highlightEntities.bind(this);
        this.highlightEntitiesBySelector = this.highlightEntitiesBySelector.bind(this);
        this.unhighlightEntities = this.unhighlightEntities.bind(this);
        this.updateData = this.updateData.bind(this);
        this.toggleSortingOrder = this.toggleSortingOrder.bind(this);
    }

    componentDidMount(){
        this.renderParallelCoordinates();
        this.setState({did_mount : true});
    }

    componentWillUnmount(){
    }

    componentDidUpdate(prevProps, prevState, snapshot){
        if(this.state.did_mount == true){
            if(prevProps.data != this.props.data)
                this.updateData()

            this.updateScales();
            if(prevProps.width != this.props.width || prevProps.height != this.props.height){
                this.repositionScales();
            }else if(this.state.sortingChanged === true){
                this.repositionScales();
                this.state.sortingChanged = false;
            }

            this.updateParallelCoordinates();
        }
    }

    highlightEntities(d){
        d3.entries(d).map(entry=>{
            d3.selectAll(`.${entry.key}-${entry.value}`).classed('hovered',true)
        })
    }

    highlightEntitiesBySelector(d){
        d3.selectAll(d).classed('hovered',true)
    }

    unhighlightEntities(d){
        d3.selectAll(".hovered").classed('hovered',false)
    }

    updateData(){
        this.data = [];
        this.filters = [];

        for(let i=0; i<this.props.data.length; i++){
            let entry = {};
            this.props.attributes.map(attr=>{
                // The uris are shrotten 
                let value = this.props.data[i][attr.name].valueOf();
                    value = String(value).includes('/')?value.split('/')[value.split('/').length-1]:value
                entry[attr.name] = value;
            })
            this.data.push(entry);
        }
    }

    brushEventHandler(feature){
        // Ignore brush-by-zoom
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") 
            return; 
        // Handle wether to remove filters or apply a new one
        if(d3.event.selection != null){
            this.filters[feature] = d3.event.selection[0]>d3.event.selection[1]?[
                    d3.event.selection[1],d3.event.selection[0]
                ]:[
                    d3.event.selection[0],d3.event.selection[1]
                ];
            d3.select('g.feature#'+feature+' g.axis')
                .selectAll('text')
                .style('fill', x=>this.inside(this.yScales[feature](x),feature)===true?'black':'lightgrey');
        }else{
            if(feature in this.filters)
                delete(this.filters[feature]);
            d3.select('g.feature#'+feature+' g.axis')
                .selectAll('text')
                .style('fill','black');
        }
        this.applyFilters();
    }

    toggleSortingOrder(attribute){
        const sortingUpdated = (prev,attribute)=>{
            prev[attribute] = prev[attribute]=='up'?'down':'up';
            return(prev);
        }; 
        this.setState(prev=>({sorting: sortingUpdated(prev.sorting, attribute), sortingChanged:true}));
    }

    selected(d){
        const _filters = d3.entries(this.filters);
        return _filters.every(f=>{
            return f.value[0] <= this.yScales[f.key](d[f.key]) && this.yScales[f.key](d[f.key]) <= f.value[1];
        });
    }

    applyFilters(){
        d3.select('g.active').selectAll('path')
          .style('display', d=>(this.selected(d)?null:'none'));
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

        d3.select(this.inactive).selectAll('path')
            .data(this.data)
            .enter()
                .append('path')
                .attr('d', d=>this.linePath(d));

        // active data
        d3.select(this.active).selectAll('path')
          .data(this.data)
          .enter()
            .append('path')
            .attr('d', d=>this.linePath(d))
            .each(function(d){
                const node = d3.select(this);
                d3.entries(d).map(entry=>node.classed(`${entry.key}-${entry.value}`, true))
            })
            .attr('stroke',(d,i)=>this.colorScale(d[this.state.colorAttribute]))
            .on("mouseover", this.highlightEntities)
            .on("mouseout", this.uhighlightEntities);

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

        const yBrushes = this.yBrushes;
        featureAxisG
          .each(function(d){
            d3.select(this)
              .append('g')
              .attr('class','brush')
              .call(yBrushes[d.name]);
        });

        featureAxisG
          .append("text")
          .attr("class", "SortBy")
          .attr("transform", "rotate(-20)")
          .attr('y', params.paddingTop+ params.marginTop + 10)
          .attr('x', -20)
          .text(d=>d.name+(this.state.sorting[d.name]=="up"?"⯆":"⯅"))
          .on("click",d=>this.toggleSortingOrder(d.name));
    }

    updateParallelCoordinates(){
        // inactive data
        let inactive = d3.select(this.inactive).selectAll('path')
          .data(this.data)
        inactive.exit().remove();
        inactive.enter().append('path');

        d3.select(this.inactive).selectAll('path')
            .attr('d', d=>this.linePath(d));

        // active data
        let active = d3.select(this.active).selectAll('path')
          .data(this.data)
        active.exit().remove();
        active.enter().append('path');

        d3.select(this.active).selectAll('path')
            .each(function(d){
                const node = d3.select(this);
                d3.entries(d).map(entry=>node.classed(`${entry.key}-${entry.value}`, true))
            })
            .attr('d', d=>this.linePath(d))
            .attr('stroke',(d,i)=>this.colorScale(d[this.state.colorAttribute]))
            .on("mouseover", this.highlightEntities)
            .on("mouseout", this.unhighlightEntities);
    }

    updateScales(){
        this.xScale = d3.scalePoint()
          .domain(this.props.attributes.map(x=>x.name))
          .range([params.paddingLeft, this.props.width-params.paddingRight-params.legendWidth - params.marginRight]);
        
        const domain = {}, 
              range = [this.props.height-params.marginTop - params.paddingBottom, params.paddingTop + params.marginTop +20];

        // Each attribute has its own array with the unique values used as the domain
        this.props.attributes.map(attr=>domain[attr.name] = []);
        this.data.map(x=>{  
            this.props.attributes.map(attr=>{
                let value = x[attr.name].valueOf();
                    value = String(value).includes('/')?value.split('/')[value.split('/').length-1]:value;
                if(!domain[attr.name].includes(value))
                    domain[attr.name].push(value);
            });
        });

        // Each attribute has an scale for the y axis
        this.yScales = {};
        const sortUp = (a,b)=>(a<b), sortDown = (a,b)=>(a>b);
        this.props.attributes.map(attr=>{
            this.yScales[attr.name] = d3.scalePoint()
                .domain(domain[attr.name].sort(this.state.sorting[attr.name]=='up'?sortUp:sortDown))
                .range(range)
        });

        this.yAxis = {};
        d3.entries(this.yScales).map((x,i)=>{
            if(i < d3.keys(this.yScales).length/2)
                this.yAxis[x.key] = d3.axisLeft(x.value).tickFormat(d=>String(d).substring(0,params.axisTickLength));
            else
                this.yAxis[x.key] = d3.axisRight(x.value).tickFormat(d=>String(d).substring(0,params.axisTickLength));
        });    

        this.yBrushes = {};
        let extent = [
            [-(params.brush_width/2), params.paddingTop + 20 + params.marginTop],
            [params.brush_width/2, this.props.height-params.paddingBottom-params.marginTop]
        ];


        d3.entries(this.yScales).map(x=>{
              this.yBrushes[x.key]= d3.brushY()
                .extent(extent)
                .on('brush', ()=>this.brushEventHandler(x.key))
                .on('end', ()=>this.brushEventHandler(x.key));
        });

        this.colorScale = d3.scaleOrdinal( d3.schemeSet3)
            .domain(this.yScales[this.state.colorAttribute].domain());
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

        const yBrushes = this.yBrushes;

        featureAxisG
          .each(function(d){
            d3.select(this)
              .append('g')
              .attr('class','brush')
              .call(yBrushes[d.name]);
        });

        featureAxisG
          .append("text")
          .attr("class", "SortBy")
          .attr("transform", "rotate(-20)")
          .attr('y', params.paddingTop+ params.marginTop + 10)
          .attr('x', -20)
          .text(d=>d.name+(this.state.sorting[d.name]=="up"?"⯆":"⯅"))
          .on("click",d=>this.toggleSortingOrder(d.name));
      }

    updateColorAttribute(attribute){
        this.colorScale = d3.scaleOrdinal( d3.schemeSet3)
            .domain(this.yScales[attribute].domain())

        d3.select(this.active).selectAll('path')
            .attr('stroke',(d,i)=>this.colorScale(d[attribute]));
        this.setState({colorAttribute: attribute})
    }

    render(){
        const last_field_of_uri = (uri)=>uri.includes('/')?uri.split('/')[uri.split('/').length-1]:uri;

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
                            <g transform={`translate(0,${17 + i*16})`} 
                                    key={'legend-'+i}
                                    className={`${this.state.colorAttribute}-${last_field_of_uri(String(d))}`}
                                    onMouseEnter={()=>this.highlightEntitiesBySelector(`.${this.state.colorAttribute}-${last_field_of_uri(String(d))}`)}
                                    onMouseOut={()=>this.unhighlightEntities()}>
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
