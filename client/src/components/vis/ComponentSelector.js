import * as d3 from 'd3';
import React from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css'
import OptionTags from './OptionTags.js';

/* ComponentSelector
 * Allows the creation of new vis components by calling the addComponent function
 * provided as a prop, using the selected name, type and subset of entities.
 *
 * Each of the attributes selected is stored as an object with the following attributes :
    name: a full descriptive name for the attribute,
    type: data type for the tag,
    attribute: attribute selected to be displayed or aggregated,
    aggregation: the type of aggregation to be used,
    aggregation_term: the attribute by which to aggregate,
    data_total: the total count of different values,
    unique: the total size of the dataset
 */

class ComponentSelector extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            name: "",
            attributes: [],
            type: "",
            typeIndex: 0,
            showComponents: false,
            data : [],
            useful_visualizations: [],
            vis_incompatibilities: []
        };

        this.handleNameChange = this.handleNameChange.bind(this);
        this.handlePrevType = this.handlePrevType.bind(this);
        this.handleNextType = this.handleNextType.bind(this);
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
        if(attribute){
            this.setState((prevState)=>{
                const index = prevState.attributes.map(a=>a.name).indexOf(attribute.name);
                // If it is not already included
                if(index ==-1){
                    if(attribute.aggregation == 'none'){
                        attribute.unique = this.props.data.length;
                        attribute.data_total = this.props.data.length;
                    }else{
                        // Compute the amount of different groups available
                        const attribute_values = {};
                        this.props.data.map(e=>{
                            if(!attribute_values[e[attribute.aggregation_term]])
                                attribute_values[e[attribute.aggregation_term]]=1;
                        });
                        attribute.unique = d3.keys(attribute_values).length;
                        attribute.data_total = this.props.data.length;

                    } 
                    prevState.attributes.push(attribute)
                }
                return(prevState);
            });
        }
    }

    removeAttribute(attribute){
        if(attribute)
            this.setState((prevState)=>{
                prevState.attributes = prevState.attributes.filter(e=>e.name!=attribute.name);
                return(prevState);
            });
    }

    handlePrevType(newIndex){
        let index = newIndex>=0?newIndex:this.props.availableComponents.length-1;
        index = index<this.props.availableComponents.length?index:0;
        while(!this.state.useful_visualizations.includes(this.props.availableComponents[index])){
            index = index - 1;
            index = index>=0?index:this.props.availableComponents.length-1;
        }

        this.setState({typeIndex: index, type: this.props.availableComponents[index]});
    }

    handleNextType(newIndex){
        let index = newIndex>0?newIndex:this.props.availableComponents.length-1;
        index = index<this.props.availableComponents.length?index:0;
        while(!this.state.useful_visualizations.includes(this.props.availableComponents[index])){
            index += 1;
            index = index<this.props.availableComponents.length?index:0;
        }
        
        this.setState({typeIndex: index, type: this.props.availableComponents[index]});
    }

    createComponent(){
        if(this.state.name != "" && this.state.attributes.length>0 && this.state.type != ""){
            this.props.addComponent(this.state.name, this.state.attributes, this.state.type);
            this.setState({name: "", attributes: [], showComponents:false});
        }
    }

    showComponents(){
        let useful_visualizations = this.props.availableComponents;
        const vis_incompatibilities = [];

        let nonAggregated = 0, 
            aggregated = 0;

        this.state.attributes.map(a=>{
                nonAggregated += (a.aggregation=='none')?1:0;
                aggregated += (a.aggregation=='none')?0:1;
            });

        if(aggregated > 0){
            useful_visualizations = useful_visualizations.filter(vis=>vis!='Parallel Coordinates');
            vis_incompatibilities.push(`Metrics cannot be used with Parallel Coordinates.`);

            useful_visualizations = useful_visualizations.filter(vis=>vis!='Circle Packing');
            vis_incompatibilities.push(`Metrics cannot be used to create a hierarchy in Circle Packing.`);
        }

        if(aggregated == 0){
            useful_visualizations = useful_visualizations.filter(vis=>vis!='Violin Plot');
            vis_incompatibilities.push(`Violin Plot needs an aggregation (such as count) to show distribution.`);

            useful_visualizations = useful_visualizations.filter(vis=>vis!='Jitter Violin Plot');
            vis_incompatibilities.push(`Jitter Violin Plot needs an aggregation (such as count) to show distribution.`);

            useful_visualizations = useful_visualizations.filter(vis=>vis!='Bubble Graph');
            vis_incompatibilities.push(`Bubble Graph needs at least one aggregation in order to calculate the bubbles size`);

            useful_visualizations = useful_visualizations.filter(vis=>vis!='Stream Graph');
            vis_incompatibilities.push(`Stream Graph needs at least one aggregation in order to calculate the sector size`);
        }

        if(nonAggregated > 0){
            useful_visualizations = useful_visualizations.filter(vis=>vis!='Violin Plot');
            vis_incompatibilities.push(`Violin Plot can only show distribution of aggregated data.`);

            useful_visualizations = useful_visualizations.filter(vis=>vis!='Jitter Violin Plot');
            vis_incompatibilities.push(`Jitter Violin Plot can only show distribution of aggregated data.`);
        }

        if(nonAggregated == 0){
            useful_visualizations = useful_visualizations.filter(vis=>vis!='Bubble Graph');
            vis_incompatibilities.push(`Bubble Graph needs at least one non aggregated value to create the clusters`);

            useful_visualizations = useful_visualizations.filter(vis=>vis!='Stream Graph');
            vis_incompatibilities.push(`Stream Graph needs at least one non aggregated value to distribute `);
        }

        if(nonAggregated < 2){
            useful_visualizations = useful_visualizations.filter(vis=>vis!='Parallel Coordinates');
            vis_incompatibilities.push(`At least two values have to selected to use Parallel Coordinates.`);
        }

        this.state.attributes.map(a=>{
            if(a.unique > 120){
                vis_incompatibilities.push(`${a.name} takes too many different values to be used with a Pie Chart.`);
                vis_incompatibilities.push(`${a.name} takes too many different values to be used with an Bar Chart.`);
            }
        })

        if(false === this.state.attributes.reduce((a,b)=>a&&b.unique<140,true)){
            useful_visualizations = useful_visualizations.filter(vis=>vis!='Pie Chart');
            vis_incompatibilities.push(`No attribute has less than 120 different values to be used with a Pie Chart.`);
            useful_visualizations = useful_visualizations.filter(vis=>vis!='Bar Chart');
            vis_incompatibilities.push(`No attribute has less than 120 different values to be used with an Bar Chart.`);
        }

        if(false === this.state.attributes.reduce((a,b)=>a&&(b.unique == this.state.attributes[0].unique),true)){
            useful_visualizations = useful_visualizations.filter(vis=>vis!='Table');
            vis_incompatibilities.push(`All attributes must have the same amount of entries to be displayed in a table.`);
        }

        this.setState({showComponents:true, type:useful_visualizations[0], useful_visualizations:useful_visualizations, vis_incompatibilities:vis_incompatibilities});
    }

    backToEntities(){
        this.setState({showComponents:false});
    }

    renderMenu(){
        const carouselOptions = {
            "Bar Chart":<img className="button" alt="Bar Chart" title="Bar Chart" key="Bar Chart" 
                height={this.props.height-200} src={"/public/bar.svg"}/>,
            "Bubble Graph":<img className="button" alt="Bubble Graph" title="Bubble Graph" key="Bubble Graph" 
                height={this.props.height-200} src={"/public/bubblegraph.svg"}/>,
            "Circle Packing":<img className="button" alt="Circle Packing" title="Circle Packing" key="Circle Packing" 
                height={this.props.height-200} src={"/public/circlepacking.svg"}/>,
            "Packed Bubbles":<img className="button" alt="Packed Bubbles" title="Packed Bubbles" key="Packed Bubbles" 
                height={this.props.height-200} src={"/public/circlepacking.svg"}/>,
            "Parallel Coordinates":<img className="button" alt="Parallel Coordinates" title="Parallel Coordinates" key="Parallel Coordinates" 
                height={this.props.height-200} src={"/public/ppcc.svg"}/>,
            "Pie Chart":<img className="button" alt="Pie Chart" title="Pie Chart" key="Pie Chart" 
                height={this.props.height-200} src={"/public/pie.svg"}/>,
            "Stream Graph":<img className="button" alt="Stream Graph" title="Stream Graph" key="Stream Graph" 
                height={this.props.height-200} src={"/public/streamgraph.svg"}/>,
            "Table":<img className="button" alt="Table" title="Table" key="Table" 
                height={this.props.height-200} src={"/public/table.svg"}/>,
            "Violin Plot":<img className="button" alt="Violin Plot" title="Violin Plot" key="Violin Plot" 
                height={this.props.height-200} src={"/public/violinplot.svg"}/>,
            "Jitter Violin Plot":<img className="button" alt="Jitter Violin Plot" title="Jitter Violin Plot" key="Jitter Violin Plot" 
                height={this.props.height-200} src={"/public/jitterviolinplot.svg"}/>,
        };

        if(this.state.name != "" && this.state.attributes.length>0 && this.state.showComponents === true){
            return(
            <div className="menu-panel">
                <ul>
                    <li>Variables chosen <a onClick={()=>this.backToEntities()}>(back to selection)</a> :</li>
                    <li>{this.state.attributes.reduce((a,b)=>b.name+', '+a, "")}</li>
                    <hr/><br/>
                    <li>Current selected visualization : {this.state.type}</li>
                    <li>
                        <div id="miniatureCarousel">
                        <button onClick={()=>this.handlePrevType(this.state.typeIndex-1)}>{"< Previous"}</button>
                        {carouselOptions[this.props.availableComponents[this.state.typeIndex]]}
                        <button onClick={()=>this.handleNextType(this.state.typeIndex+1)}>{"Next >"}</button>
                        </div>
                    </li>
                </ul>
                <a onClick={()=>alert(this.state.vis_incompatibilities.map(e=>`${e}\n`))} style={{cursor:'pointer'}}>Show incompatiblities </a>
                <br/>
                <a onClick={this.createComponent}>Create view</a>
            </div>
            );
        }else{
            const selectionMade = this.state.name != "" && this.state.attributes.length>0;
            return(
            <div className="menu-panel">
            <ul>
                <li>Name for the new view :</li>
                <li><input type="text" value={this.state.name} onChange={this.handleNameChange} /></li>
            </ul>
            <ul>
                <li>Variables to explore on the new view :</li>
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
