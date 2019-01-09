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

class StreamGraph extends React.Component{
    constructor(props){
        super(props);
        this.updateData = this.updateData.bind(this);

        this.availableCuantitativeDimensions = 
            props.attributes.filter(x=>x.type="num"||x.aggregation!="none");
        this.availableXAxisDimensions = 
            props.attributes.filter(x=>x.type="String"&&x.aggregation=="none");

        state = {
            cuantitativeDimension: this.availableCuantitativeDimensions[0],
            xAxisDimension: this.availableXAxisDimensions[0],
            data: this.updateData(props.data,
                this.availableCuantitativeDimensions[0],
                this.availableXAxisDimensions[0]),
        };

        this.node = d3.select(this.node);
        this.selectAttribute = this.selectAttribute.bind(this);
        this.highlightEntities = this.highlightEntities.bind(this);
        this.unhighlightEntities = this.unhighlightEntities.bind(this);
        this.filterBySomeAttribute = this.filterBySomeAttribute.bind(this);
        this.setSortBy = this.setSortBy.bind(this);
    }

    componentDidMount(){
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
            const {data, total} = this.updatedData(this.state.selected_attribute);
            this.setState({data,total});
        }
        if(prevProps.width != this.props.width){}
        if(prevProps.height != this.props.height){}
    }

    // UpdateData makes the aggregation
    updateData(data, cuantTerm, aggrTerm){
        let uniqueCuantTermKeys = new Map();
        const results_map = {}, aggregated = new Map();
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
            let entry = {}
            entry[cuantTerm.aggregation_term] = label;
            entry.value = 0;

            for(let key of aggregated.keys()){
                entry[aggrTerm.attribute] = key;
                if(!aggregated.get(key).has(label))
                    aggregated.get(key).set(label, entry);
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
        return(Array.concat(...Array.from(aggregated.values()).map(map=>Array.from(map.values()))));
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

    highlightEntities(selector){
        d3.selectAll('.'+selector).classed('hovered',true);
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
            <div id="Dummy" className="visualization" style={size} ref={node => this.domElement = node}>
                <p style={{margin:0}}>Dummy component</p>
                <p style={{margin:0}}>Select the attribute used for the sectors : {this.props.attributes.map(e=>(
                    <span key={e.name} onClick={()=>this.selectAttribute(e)} className="option"> {e.name} </span>
                ))}</p>
                <svg ref={node => this.svg = node} 
                width={this.props.width - params.marginRight}
                height={this.props.height - params.marginTop}>
                    <g ref={node => this.g_element = node}/>
                </svg>
            </div>
        );
    }
}

export default StreamGraph;
