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

class Dummy extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            sector_dimension:"",
            data: null,
            total: 1
        };

        this.node = d3.select(this.node);
        this.selectAttribute = this.selectAttribute.bind(this);
        this.highlightEntities = this.highlightEntities.bind(this);
        this.unhighlightEntities = this.unhighlightEntities.bind(this);
        this.filterBySomeAttribute = this.filterBySomeAttribute.bind(this);
    }

    componentDidMount(){
    }

    componentWillUnmount(){
    }

    componentWillUpdate(nextProps, nextState){
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.data != this.props.data){}
        if(prevProps.width != this.props.width){}
        if(prevProps.height != this.props.height){}
    }

    selectAttribute(attribute){
        this.setState({data:attribute.data, sector_dimension:attribute.name, total:attribute.data_total})
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

    render(){
        const size = {
            width: this.props.width+"px",
            height: (this.props.height)+"px"
        }
        
        return(
            <div id="Dummy" className="visualization" style={size} ref={node => this.domElement = node}>
                <p style={{margin:0}}>Dummy component</p>
                <p style={{margin:0}}>Select the attribute used for the sectors : {this.props.attributes.map(e=>(
                    <span key={e.name} onClick={()=>this.selectAttribute(e)} className="option" style={style(e.name)}> {e.name} </span>
                ))}</p>
            </div>
        );
    }
}

export default Dummy;
