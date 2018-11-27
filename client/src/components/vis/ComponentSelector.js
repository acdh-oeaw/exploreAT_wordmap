import * as d3 from 'd3';
import React from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css'
import OptionTags from './OptionTags.js';

/* ComponentSelector
 * Allows the creation of new vis components by calling the addComponent function
 * provided as a prop, using the selected name, type and subset of entities.
 */

class ComponentSelector extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            name: "",
            attributes: [],
            type: "",
            showComponents: false,
            data : [],
            useful_visualizations: []
        };

        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleTypeChange = this.handleTypeChange.bind(this);
        this.createComponent = this.createComponent.bind(this);
        this.renderMenu = this.renderMenu.bind(this);
        this.showComponents = this.showComponents.bind(this);
        this.backToEntities = this.backToEntities.bind(this);
        this.addAttribute = this.addAttribute.bind(this);
        this.removeAttribute = this.removeAttribute.bind(this);
    }

    handleNameChange(event){
        this.setState({name: event.target.value});
    };

    addAttribute(attribute){
        if(attribute)
            this.setState((prevState)=>{
                const index = prevState.attributes.map(a=>a.name).indexOf(attribute.name);
                if(index ==-1){
                        let data = {};
                    if(attribute.aggregation == 'none'){
                        data[attribute.attribute] = this.props.data.map(d=>d[attribute.attribute]);
                        attribute.data = data;
                        attribute.data_length = this.props.data.length;
                        attribute.data_total = this.props.data.length;
                    }
                    else{
                        let total = 0;
                        const attribute_values = {};
                        this.props.data.map(e=>{
                            if(!attribute_values[e[attribute.attribute]])
                                attribute_values[e[attribute.attribute]] = e;
                        });
                        d3.values(attribute_values).map(e=>{
                            if(data[e[attribute.aggregation_term]]){
                                total += 1;
                                data[e[attribute.aggregation_term]] += 1;
                            }
                            else{
                                total += 1;
                                data[e[attribute.aggregation_term]] = 1;
                            }
                        });
                        attribute.data = data;
                        attribute.data_length = d3.keys(data).length;
                        attribute.data_total = total;

                    } 
                    prevState.attributes.push(attribute)
                }
                return(prevState);
            });
    }

    removeAttribute(attribute){
        if(attribute)
            this.setState((prevState)=>{
                prevState.attributes = prevState.attributes.filter(e=>e.name!=attribute.name);
                return(prevState);
            });
    }

    handleTypeChange(type){
        this.setState({type: type.value});
    };

    createComponent(){
        if(this.state.name != "" && this.state.attributes.length>0 && this.state.type != ""){
            this.props.addComponent(this.state.name, this.state.attributes, this.state.type);
            this.setState({name: "", attributes: [], showComponents:false});
        }
    }

    showComponents(){
        const useful_visualizations = this.props.availableComponents[0];
        this.setState({showComponents:true, useful_visualizations:useful_visualizations});
    }

    backToEntities(){
        this.setState({showComponents:false});
    }

    renderMenu(){
        if(this.state.name != "" && this.state.attributes.length>0 && this.state.showComponents === true){
            return(
            <div className="menu-panel">
                <ul>
                    <li>Attributes chosen <a onClick={()=>this.backToEntities()}>(back to selection)</a> :</li>
                    <li>{this.state.attributes.reduce((a,b)=>b.name+', '+a, "")}</li>
                    <hr/><br/>
                    <li>Type of component to be created :</li>
                    <li>
                        <Dropdown 
                            options={this.props.availableComponents} 
                            onChange={this.handleTypeChange} 
                            value={this.state.useful_visualizations} 
                            placeholder="Select an type" /></li>
                </ul>
                <a onClick={this.createComponent}>Create component</a>
            </div>
            );
        }else{
            const selectionMade = this.state.name != "" && this.state.attributes.length>0;
            return(
            <div className="menu-panel">
            <ul>
                <li>Name for the new component :</li>
                <li><input type="text" value={this.state.name} onChange={this.handleNameChange} /></li>
            </ul>
            <ul>
                <li>Attributes to explore on the new component :</li>
                <li>
                    <OptionTags 
                        tags={this.state.attributes}
                        options={this.props.entities}
                        addTag={this.addAttribute}
                        removeTag={this.removeAttribute}
                    />
                </li>
            </ul>
            <a onClick={()=>this.showComponents()} style={{display:selectionMade===true?'initial':'none'}}>Choose visualization</a>
            </div>
            );
        }
    }

    render(){
        const size = {width: this.props.width+"px", height: this.props.height+"px"}

        return(
            <div id="ComponentSelector" style={size}>
                {this.renderMenu()}
            </div>
        );
    }
}

export default ComponentSelector;
