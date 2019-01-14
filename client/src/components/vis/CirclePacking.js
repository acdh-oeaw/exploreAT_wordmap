import * as d3 from 'd3';
import React from 'react';

/* StreamGraph
 * StreamGraph visualization for representing the evolution or distribution 
 * of an aggregation over a variable
 * 
 * It must receive at least one aggregated attribute and another one not aggregated
 *
 * The component updates each time the data is been filtered, or the size of the
 * container changes.
 *
 * The following props are been passed to the component:
 - data: the array of objects for each of the entries
 - filters: a js object with the keys been the names of the dimensions and the key the filters
 - updateFilteredData: a method to be called each time a filter is been changed in this component,
 -      which will trigger an update that will enable the components to be aware of the filters.
 */

 /* How highlighting can be done
  * 
  * className={`${this.state.legend}-${last_field_of_uri(String(d.key))}`}
  * An example on how it would en up a class : "Questionnaire-57"
  *
  * onMouseEnter={()=>this.highlightEntities(`${this.state.legend}-${last_field_of_uri(String(d.key))}`)}
  * onMouseOut={()=>this.unhighlightEntities()}

 */
const params = {
    legendWidth: 200,
    marginTop: 25, // for the selection of 
    marginRight: 10, // because of the padding of the container
    paddingLeft:10,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
 };

class CirclePacking extends React.Component{
    constructor(props){
        super(props);
        // Auxiliary functions to manage strings
        this.stripUri = (value)=>String(value).includes('/')?value.split('/')[value.split('/').length-1]:value;
        this.sanitizeClassName = (name)=>(name.replace(/"/g,'').replace(/\./g,'').replace(/ /g, ''));
        this.updateData = this.updateData.bind(this);

        const state = {
            hierarchy: this.props.attributes,
            data: this.updateData(props.data,
                this.props.attributes),
            hierarchyChanged: false
        };

        this.state = state;

        this.node = d3.select(this.node);
        this.moveAttribute = this.moveAttribute.bind(this);
        this.highlightEntities = this.highlightEntities.bind(this);
        this.unhighlightEntities = this.unhighlightEntities.bind(this);
        this.filterBySomeAttribute = this.filterBySomeAttribute.bind(this);
        this.setSortBy = this.setSortBy.bind(this);
        this.renderCirclePacking = this.renderCirclePacking.bind(this);

    }

    componentDidMount(){
        this.renderCirclePacking();
    }

    componentWillUnmount(){
    }

    shouldComponentUpdate(nextProps, nextState) {
        let shouldUpdate = false;

        shouldUpdate = shouldUpdate || (nextState.sortBy != this.state.sortBy);
        shouldUpdate = shouldUpdate || (nextState[`${nextState.sortBy}SortOrder`] != this.state[`${nextState.sortBy}SortOrder`]);
        shouldUpdate = shouldUpdate || (nextProps.width != this.props.width);
        shouldUpdate = shouldUpdate || (nextProps.height != this.props.height);
        shouldUpdate = shouldUpdate || (nextProps.data != this.props.data);
        shouldUpdate = shouldUpdate || (nextState.data != this.state.data);
        shouldUpdate = shouldUpdate || (nextState.hierarchyChanged === true);

        return shouldUpdate;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.data != this.props.data || this.state.hierarchyChanged===true){
            const data = this.updateData(this.props.data,
                this.state.hierarchy);
            this.setState({data, hierarchyChanged:false}, this.renderCirclePacking);
        }
        if(prevProps.width != this.props.width || prevProps.height != this.props.height){
            this.renderCirclePacking
        }
    }

    updateData(data, hierarchy){
        const results = [];
        
        const parents = new Map();
        parents.set('root', {id:'root',size:null});

        for(let d of data)
            results.push(
                {id: hierarchy
                    .map(x=>d[x.attribute])
                    .reduce((a,b,i)=>{
                        const accumulated = a+(a==''?'':'.')+this.sanitizeClassName(this.stripUri(String(b)));
                        if(i<hierarchy.length-1 && parents.get(accumulated) == undefined)
                            parents.set(accumulated,{id:accumulated,size:null});
                        return accumulated;
                    },"root"),
                size:1
                }
            );

        return Array.prototype.concat(Array.from(parents.values()),results);
    }

    renderCirclePacking(){
        const stripUri = this.stripUri,
            sanitizeClassName = this.sanitizeClassName,
            height = this.props.height,
            width = this.props.width-200;

        const stratify = d3.stratify()
            .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });

        const pack = d3.pack()
            .size([width - 2, height - 2])
            .padding(3);

        const vData = stratify(this.state.data);

        let vLayout = d3.pack().size([width, height]);

        // Layout + Data
        const vRoot = d3.hierarchy(vData).sum(function (d) { return d.data.size; });
        const vNodes = vRoot.descendants();
        vLayout(vRoot);
        let g = d3.select(this.svg).select('g');
        if(g != undefined)
            g.remove();
        g = d3.select(this.svg).attr('width', width).attr('height', height).append('g');
        
        const vSlices = g.selectAll('g').data(vNodes).enter().append('g');

        // Draw on screen
        vSlices.append('tittle')
            .text(d=>d.data.id.split('.')[d.data.depth])
            
        vSlices.append('circle').attr('cx', function (d) { return d.x; })
            .attr('cy', function (d) { return d.y; })
            .attr('r', function (d) { return d.r; })
            .attr('class', d=>d.data.depth==0?'':`${this.state.hierarchy[d.data.depth-1]['attribute']}-${d.data.id.split('.')[d.data.depth]}`)
            .on("mouseover", this.highlightEntities)
            .on("mouseout", this.unhighlightEntities)
            .style('fill',d=>d.data.depth==0
                ?'white'
                :this.props.colorScales[this.state.hierarchy[d.data.depth-1]['attribute']](d.data.id.split('.')[d.data.depth]));
    }

    moveAttribute(prevIndex,newIndex){
        this.setState(prev=>{
            const t = prev.hierarchy.splice(prevIndex,1)[0];
            prev.hierarchy.splice(newIndex,0,t);
            prev.hierarchyChanged=true;
            return(prev);
        });
    }

    // Example of to use filtering
    filterBySomeAttribute(attribute, value){
        this.props.filters[attribute].filter(value);
        this.props.updateFilteredData()
    }

    highlightEntities(d){
        if(d.data.depth != 0){
            const selector = `.${this.state.hierarchy[d.data.depth-1]['attribute']}-${d.data.id.split('.')[d.data.depth]}`;
            d3.selectAll(selector).classed('hovered',true);
        }
    }

    unhighlightEntities(d){
        d3.selectAll(".hovered").classed('hovered',false)
    }

    setSortBy(value){
        this.setState(prev=>({
            keySortOrder:((value!='key' && prev.keySortOrder == 'up')
                || (value=='key' && value==prev.sortBy && prev.keySortOrder == 'down')
                || (value=='key' && value!=prev.sortBy && prev.keySortOrder=='up')
                ?'up':'down'),
            valueSortOrder:((value!='value' && prev.valueSortOrder == 'up')
                || (value=='value' && value==prev.sortBy && prev.valueSortOrder == 'down')
                || (value=='value' && value!=prev.sortBy && prev.valueSortOrder=='up')
                ?'up':'down'),
            sortBy:value,
            sortingFunction: this.sortingFunctions[value][(prev.sortBy!=value?prev[`${value}SortOrder`]:(prev[`${value}SortOrder`]=='up'?'down':'up'))]
        }));
    }

    render(){
        const size = {
            width: this.props.width+"px",
            height: (this.props.height)+"px"
        }
        
        return(
            <div id="CirclePacking" className="visualization" style={size} ref={node => this.domElement = node}>
                <svg ref={node => this.svg = node}></svg>
                <div className="menu">
                {this.state.hierarchy.map((x,i)=>(
                    <div key={x.attribute}>
                        <span >
                        {x.attribute} 
                        {i>0
                            ?<span className="button" onClick={()=>this.moveAttribute(i,i-1)}> up </span>
                            :""}
                        {i<this.state.hierarchy.length-1
                            ?<span className="button" onClick={()=>this.moveAttribute(i,i+1)}> down </span>
                            :""}
                        </span>
                        <br/>
                    </div>
                ))
                }
                </div>
            </div>
        );
    }
}

export default CirclePacking;