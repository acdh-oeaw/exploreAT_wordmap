import * as d3 from 'd3';
import React from 'react';

/* BubbleGraph
 * 

 */
const params = {
    legendWidth: 200,
    marginTop: 25, // for the selection of 
    marginRight: 10, // because of the padding of the container
    paddingLeft:20,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
 };

class BubbleGraph extends React.Component{
    constructor(props){
        super(props);
        this.updateData = this.updateData.bind(this);

        this.availableCuantitativeDimensions = 
            props.attributes.filter(x=>x.type="num"||x.aggregation!="none");
        this.availableXAxisDimensions = 
            props.attributes.filter(x=>x.type="String"&&x.aggregation=="none");

        const state = {
            cuantitativeDimension: this.availableCuantitativeDimensions[0],
            xAxisDimension: this.availableXAxisDimensions[0],
            data: this.updateData(props.data,
                this.availableCuantitativeDimensions[0],
                this.availableXAxisDimensions[0]),
        };

        this.state = state;

        this.node = d3.select(this.node);
        this.selectAttribute = this.selectAttribute.bind(this);
        this.highlightEntities = this.highlightEntities.bind(this);
        this.unhighlightEntities = this.unhighlightEntities.bind(this);
        this.filterBySomeAttribute = this.filterBySomeAttribute.bind(this);
        this.setSortBy = this.setSortBy.bind(this);
        this.renderBubbleGraph = this.renderBubbleGraph.bind(this);
        this.stripUri = (value)=>String(value).includes('/')?value.split('/')[value.split('/').length-1]:value;
        this.sanitizeClassName = (name)=>(name.replace(/"/g,'').replace(/\./g,'').replace(/ /g, ''));
    }

    componentDidMount(){
        this.renderBubbleGraph();
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
        shouldUpdate = shouldUpdate || (nextState.selected_attribute != this.state.selected_attribute);

        return shouldUpdate;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.data != this.props.data){
            const data = this.updateData(this.props.data,
                this.state.cuantitativeDimension,
                this.state.xAxisDimension);
                
            this.setState({data});
        }
        if(prevProps.width != this.props.width){
            this.renderBubbleGraph();
        }
        if(prevProps.height != this.props.height){
            this.renderBubbleGraph();
        }
    }

    // UpdateData makes the aggregation
    updateData(data, cuantTerm, aggrTerm){
        let uniqueCuantTermKeys = new Map();
        let results_map = {}, aggregated = new Map();
        for(let x of data){
            const label = x[cuantTerm.aggregation_term], 
                aggrTerm_value = x[aggrTerm.attribute];
            let value = 1;

            // building an array with the calculation done over the aggregation term 
            // aggregated by the attributed used in the x axis 
            if(results_map[label]){
                if(results_map[label][aggrTerm_value])
                    value = results_map[label][aggrTerm_value] + 1;
            }else{
                results_map[label] = {};
            }
            results_map[label][aggrTerm_value] = value;

            // building a Map with each of different values of the aggregated data so that 
            // there's extra computation by calculating twice the the times the value, but the data 
            // is looped once
            let entry = {}
            entry[cuantTerm.aggregation_term] = label;
            entry[aggrTerm.attribute] = aggrTerm_value;
            entry.value = value;

            aggregated.set(aggrTerm_value, aggregated.has(aggrTerm_value)?
                aggregated.get(aggrTerm_value).set(label, entry):
                (new Map()).set(label,entry));

            uniqueCuantTermKeys.set(label,1);
        }
        results_map = null;
        
        // give each label a default value of 0 if there is no entry for it for a certain aggregation term
        for(let label of uniqueCuantTermKeys.keys()){
            for(let key of aggregated.keys()){
                let entry = {}
                entry[cuantTerm.aggregation_term] = label;
                entry.value = 0;
                entry[aggrTerm.attribute] = key;
                if(!aggregated.get(key).has(label)){
                    aggregated.get(key).set(label, entry);
                }
            }
        }

        // calculate and assign the offsets for each of the entries
        const offsets = d3.stack()
                .keys(Array.from(uniqueCuantTermKeys.keys()))
                .value((d, key) => d.get(key).value)
                .offset(d3.stackOffsetSilhouette)(
            Array.from(aggregated.values())
        );

        for (const layer of offsets) {
            for (const d of layer) {
                d.data.get(layer.key).values = [d[0], d[1]];
            }
        }

        // it is returned a flatten data structure
        const result = new Map();
        for(let label of uniqueCuantTermKeys.keys())
            result.set(label, []);

        for(let entries of Array.from(aggregated.values()).map(map=>Array.from(map.values()))){
            entries.map(d=>{
                result.get(d[cuantTerm.aggregation_term]).push(d)});
        }        

        return(Array.from(result.keys()).map(x=>[x,result.get(x)]));
    }

    renderBubbleGraph(){
        const stripUri = this.stripUri,
            sanitizeClassName = this.sanitizeClassName,
            height = this.props.height-60,
            width = this.props.width-60;

        const x = d3.scalePoint()
            .domain(this.state.data[0][1].map(d=>d[this.state.xAxisDimension.attribute]))
            .range([params.paddingLeft, width - params.marginRight-params.paddingRight]);

        const y = d3.scaleLinear()
            .domain(
                [d3.min(Array.concat(...this.state.data.map(x=>x[1])).map(d => d.values[0])), 
                d3.max(Array.concat(...this.state.data.map(x=>x[1])).map(d => d.values[1]))])
            .range([height-params.paddingBottom, params.marginTop+params.paddingTop]);

        const xAxis = g => g
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
            .call(g => g.select(".domain").remove());


        const area = d3.area()
            .curve(d3.curveStep)
            .x(d => x(d[this.state.xAxisDimension.attribute]))
            .y0(d => y(d.values[0]))
            .y1(d => y(d.values[1]));

        const svg = d3.select(this.svg);
        const prev = svg.selectAll('g');
        if(prev)
            prev.remove();
        svg.append("g")
            .attr('id','streamGraph')
            .selectAll("path")
            .data(this.state.data)
            .enter().append("path")
            .attr("fill", ([name]) => this.props.colorScales[this.state.cuantitativeDimension.aggregation_term](name))
            .attr("d", ([, values]) => area(values))
            .attr('class', d=>`${this.state.cuantitativeDimension.aggregation_term}-${this.sanitizeClassName(this.stripUri(d[0]))}`)
            .on("mouseover", this.highlightEntities)
            .on("mouseout", this.unhighlightEntities)
            .append("title")
              .text(([name, value]) => `${name}`);

          svg.append("g")
              .call(xAxis);
    }

    selectAttribute(attribute){
        const {data, total} = this.updatedData(attribute);

        this.setState({
            data, 
            total,
            legend: attribute[attribute.aggregation_term!='none'?'aggregation_term':'name'],
            sector_dimension:attribute.name, 
            selected_attribute: attribute,
        })
    }

    // Example of to use filtering
    filterBySomeAttribute(attribute, value){
        this.props.filters[attribute].filter(value);
        this.props.updateFilteredData()
    }

    highlightEntities(d){
        d3.selectAll(`.${this.state.cuantitativeDimension.aggregation_term}-${this.sanitizeClassName(this.stripUri(d[0]))}`).classed('hovered',true);
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
            <div id="BubbleGraph" className="visualization" style={size} ref={node => this.domElement = node}>
                <p style={{margin:0}}>Dummy component</p>
                <p style={{margin:0}}>Select the attribute used for the sectors : {this.props.attributes.map(e=>(
                    <span key={e.name} onClick={()=>this.selectAttribute(e)} className="option"> {e.name} </span>
                ))}</p>
                <svg ref={node => this.svg = node} 
                width={this.props.width - params.marginRight}
                height={this.props.height - params.marginTop}>
                </svg>
            </div>
        );
    }
}

export default BubbleGraph;
