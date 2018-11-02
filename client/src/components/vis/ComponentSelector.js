import * as d3 from 'd3';
import React from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css'

/* ComponentSelector
 * Draws a hull showing the area occupied by each of the groups.
 * Color of the stroke and area corresponds to each of the teams.
 * Represents the evolution of the area occupied through a line chart.
 */

class ComponentSelector extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            name: "",
            entity: "",
            type: ""
        };

        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleEntityChange = this.handleEntityChange.bind(this);
        this.handleTypeChange = this.handleTypeChange.bind(this);
        this.createComponent = this.createComponent.bind(this);
    }

    handleNameChange(event){
        this.setState({name: event.target.value});
    };

    handleEntityChange(entity){
        this.setState({entity: entity.value});
    };

    handleTypeChange(type){
        this.setState({type: type.value});
    };

    createComponent(){
        if(this.state.name != "" && this.state.entity != "" && this.state.type != ""){
            this.props.addComponent(this.state.name, this.state.entity, this.state.type);
            this.setState({name: "", entity: "", type: ""});
        }
    }

    render(){
        const size = {
            width: this.props.width+"px",
            height: this.props.height+"px"
        }
        return(
            <div id="Dummy" className="visualization" style={size}>
                {this.props.name}
                <ul>
                    <li>Name for the new component :</li>
                    <li><input type="text" value={this.state.name} onChange={this.handleNameChange} /></li>
                </ul>
                <ul>
                    <li>Entity to explore on the new component :</li>
                    <li>
                        <Dropdown 
                            options={this.props.entities.map(e=>({value:e,label:e.split('#')[1]}))} 
                            onChange={this.handleEntityChange} 
                            value={this.props.entities[0]} 
                            placeholder="Select an entity" /></li>
                </ul>
                <ul>
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
    }
}

export default ComponentSelector;
