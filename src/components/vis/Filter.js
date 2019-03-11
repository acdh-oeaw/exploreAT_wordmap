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
            filters: [
                {attribute:'ejattr', value:'sometext'},
                {attribute:'name', value:'alejandro'}
            ]
        };

        this.selectAttribute = this.selectAttribute.bind(this);
        this.filterBySomeAttribute = this.filterBySomeAttribute.bind(this);
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
            this.setState({data,total});
        }
        if(prevProps.width != this.props.width){}
        if(prevProps.height != this.props.height){}
    }

    selectAttribute(attribute){
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

    render(){
        const size = {
            width: this.props.width+"px",
            height: (this.props.height)+"px"
        }
        
        return(
            <div id="Filter" className="visualization" style={size} ref={node => this.domElement = node}>
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
                            <td>Body content 1</td>
                            <td><input></input></td>
                            <td><button>Filter</button></td>
                        </tr>
                        {this.state.filters.map(x=>(
                            <tr key={x.attribute}>
                                <td>{x.attribute}</td>
                                <td>{x.value}</td>
                                <td><button>Remove filter</button></td>
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
