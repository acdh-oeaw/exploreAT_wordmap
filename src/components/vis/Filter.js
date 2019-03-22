import * as d3 from 'd3';
import React from 'react';

/* Dummy
 * Dummy component for scaffolding vis components
 * Vis components are provided with width, height and data props
 * 
 * Data is provided as an array of objects, each of wich is an entry with 
 * a key and value for each of the attributes. 
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

class Filter extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            sector_dimension:"",
            filters: []
        };

        this.selectAttribute = this.selectAttribute.bind(this);
        this.addFilter = this.addFilter.bind(this);
        this.removeFilter = this.removeFilter.bind(this);
    }

    componentDidMount(){
    }

    componentWillUnmount(){
    }

    shouldComponentUpdate(nextProps, nextState) {
        let shouldUpdate = false;

        shouldUpdate = shouldUpdate || (nextState.filtersChanged === true);
        shouldUpdate = shouldUpdate || (nextProps.width != this.props.width);
        shouldUpdate = shouldUpdate || (nextProps.height != this.props.height);

        return shouldUpdate;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.state.filterChanged === true)
            this.state.filterChanged = false
    }

    selectAttribute(attribute){
        this.setState({
            selected_attribute: attribute,
        })
    }

    addFilter(){
        //filterBySomeAttribute(attribute, value);
        const name = this.attrSelector.value,
            value = this.attrValue.value,
            filter = function(x){return x.includes(value)};

        filter.isTextualFilter = true;

        this.setState(prev=>{
            this.props.filters[name].filter(filter);
            this.props.updateFilteredData()        

            prev.filters.push({
                name: name,
                value: value
            });
            prev.filtersChanged = true;

            return(prev)
        },()=>{
            this.attrValue.value = ''; 
        });
    }

    removeFilter(attr){
        this.setState(prev=>{
            prev.filters = prev.filters.filter(x=>x.name != attr);

            if(this.props.filters[attr].hasCurrentFilter() === true &&
                this.props.filters[attr].currentFilter().isTextualFilter === true){
                this.props.filters[attr].filterAll();
                this.props.updateFilteredData()
            }

            prev.filtersChanged = true;

            return(prev);
        });
    }

    render(){
        const size = {
            width: this.props.width+"px",
            height: (this.props.height)+"px"
        }
        
        const filteredAttributes = this.state.filters.map(d=>d.name),
            propsAttributes = this.props.attributes.map(d=>d.name);

        return(
            <div id="Filter" className="visualization" style={size} >
                <div>
                <table>
                    <thead>
                        <tr>
                            <th>Variable</th>
                            <th>Filter text</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                              <select id='attribute' ref={node => this.attrSelector = node}>
                                    {propsAttributes.filter(attr=>!filteredAttributes.includes(attr)).map(attr=>(
                                        <option key={attr} value={attr}>{attr}</option>
                                    ))}
                              </select>
                            </td>
                            <td><input ref={node => this.attrValue = node}></input></td>
                            <td><button onClick={()=>this.addFilter()}>Filter</button></td>
                        </tr>
                        {this.state.filters.map(x=>(
                            <tr key={x.name}>
                                <td>{x.name}</td>
                                <td>{x.value}</td>
                                <td><button onClick={()=>this.removeFilter(x.name)}>Remove filter</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>
        );
    }
}

export default Filter;
