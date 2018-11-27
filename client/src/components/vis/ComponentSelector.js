import * as d3 from 'd3';
import React from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css'

/* ComponentSelector
 * Allows the creation of new vis components by calling the addComponent function
 * provided as a prop, using the selected name, type and subset of entities.
 */

class ComponentSelector extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            name: "",
            entities: [],
            dimensions:[],
            type: "",
            showComponents: false,
        };

        this.handleNameChange = this.handleNameChange.bind(this);
        this.toggleEntitySelection = this.toggleEntitySelection.bind(this);
        this.handleTypeChange = this.handleTypeChange.bind(this);
        this.createComponent = this.createComponent.bind(this);
        this.renderMenu = this.renderMenu.bind(this);
        this.showComponents = this.showComponents.bind(this);
        this.backToEntities = this.backToEntities.bind(this);
    }

    handleNameChange(event){
        this.setState({name: event.target.value});
    };

    toggleEntitySelection(entity){
        if(entity && entity.length>0)
            this.setState((prevState)=>{
                if(prevState.entities.includes(entity))
                    prevState.entities = prevState.entities.filter(e=>e!=entity)
                else
                    prevState.entities.push(entity)
                return(prevState);
            });
    };

    handleTypeChange(type){
        this.setState({type: type.value});
    };

    createComponent(){
        if(this.state.name != "" && this.state.entities.length>0 && this.state.type != ""){
            this.props.addComponent(this.state.name, this.state.entities, this.state.type);
            this.setState({name: "", entities: [], showComponents:false});
        }
    }

    showComponents(){
        this.setState({showComponents:true});
    }

    backToEntities(){
        this.setState({showComponents:false});
    }

    renderMenu(){
        const styleEntities = (e)=>this.state.entities.includes(e)?{cursor:"pointer",color:"#18bc9c"}:{cursor:"pointer",color:"black"};
        const styleDimensions = (e)=>this.state.dimensions.includes(e)?{cursor:"pointer",color:"#18bc9c"}:{cursor:"pointer",color:"black"};
        if(this.state.name != "" && this.state.entities.length>0 && this.state.showComponents === true){
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
            const selectionMade = this.state.name != "" && this.state.entities.length>0;
            return(
            <div className="menu-panel">
            <ul>
                <li>Name for the new component :</li>
                <li><input type="text" value={this.state.name} onChange={this.handleNameChange} /></li>
            </ul>
            <ul>
                <li>Entity to explore on the new component :</li>
                <li>
                {this.props.entities.map(e=>(
                    <span onClick={()=>this.toggleEntitySelection(e)} style={styleEntities(e)} key={e}> {e} </span>
                    ))}
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
            <div style={size}>
                {this.renderMenu()}
            </div>
        );
    }
}

export default ComponentSelector;
