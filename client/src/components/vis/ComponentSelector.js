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
        if(attribute && attribute.length>0)
            this.setState((prevState)=>{
                if(!prevState.attributes.includes(attribute))
                    prevState.attributes.push(attribute)
                return(prevState);
            });
    }

    removeAttribute(attribute){
        if(attribute && attribute.length>0)
            this.setState((prevState)=>{
                if(prevState.attributes.includes(attribute))
                    prevState.attributes = prevState.attributes.filter(e=>e!=attribute)
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
        this.setState({showComponents:true});
    }

    backToEntities(){
        this.setState({showComponents:false});
    }

    renderMenu(){
        if(this.state.name != "" && this.state.attributes.length>0 && this.state.showComponents === true){
            return(
            <div className="menu-panel">
                <ul>
                    <li>Dimensions chosen <a onClick={()=>this.backToEntities()}>(back to selection)</a> :</li>
                    <li>{this.state.entities.reduce((a,b)=>a+', '+b)}</li>
                    <hr/><br/>
                    <li>Type of component to be created :</li>
                    <li>
                        <Dropdown 
                            options={this.props.availableComponents} 
                            onChange={this.handleTypeChange} 
                            value={this.props.availableComponents[0]} 
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
                <li>Entity to explore on the new component :</li>
                <li>
                    <OptionTags 
                        tags={this.state.attributes}
                        options={this.props.entities}
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
