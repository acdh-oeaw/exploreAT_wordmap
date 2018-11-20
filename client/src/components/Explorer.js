import React from "react";
import * as d3 from 'd3';
import { sparql } from 'd3-sparql'
import gridStyleLayout from '../../node_modules/react-grid-layout/css/styles.css';
import gridStyleResizable from '../../node_modules/react-resizable/css/styles.css';
import { BrowserRouter as Route, NavLink } from "react-router-dom";
import RGL, { WidthProvider } from "react-grid-layout";
import UrlParamWrapper from '../aux/UrlParamWrapper';

import ComponentSelector from './vis/ComponentSelector'
import VisSelectorWrapper from './vis/VisSelectorWrapper'
import VisWrapper from './vis/VisWrapper'
import Dummy from './vis/Dummy'
import Table from './vis/Table'
import PackedBubbles from './vis/PackedBubbles'
import PieChart from './vis/PieChart'
import SparqlQueryBuilder from '../aux/SparqlQueryBuilder';

const ReactGridLayout = WidthProvider(RGL);

/**
 * Explorer
 * Component for the dashboard screen. Manages the creation a deletion of 
 * vis components and the data retrieval from the SPARQL database
 *
 * @param props
 * @return {React.Component} 
 */
class Explorer extends React.Component{
  constructor(props){
    super(props);    
    
    this.state = {
      data : null,
      available_entities:[],
      loaded:false,
      layout: {
        'selector': {x: 0, y: 0, w: 2, h: 4, isDraggable:true},
      },
      visComponents: {}
    }  

    this.wrapper = new UrlParamWrapper();
    this.sparqlQueries = new SparqlQueryBuilder();
    this.onLayoutChange = this.onLayoutChange.bind(this);
    this.addComponent = this.addComponent.bind(this);
    this.removeComponent = this.removeComponent.bind(this);
    // Url query param based parameters
    this.api_url = this.wrapper.paramToUrl(this.props.match.params.sparql);
    this.ontology = this.wrapper.paramToUrl(this.props.match.params.ontology);
    this.prefix = this.wrapper.paramToUrl(this.props.match.params.prefix);
    this.triples = this.wrapper.paramToUrl(this.props.match.params.entities).split(',').filter(d=>d!="");

    this.availableComponents = {"Dummy": Dummy, "Table": Table, "PieChart": PieChart};
  }

  componentDidMount(){
    let query = this.sparqlQueries.createDataSparqlQuery(this.ontology, this.prefix, this.triples);    
    //query = this.sparqlQueries.oldQuery();//createDataSparqlQuery(this.entries, this.ontology, this.prefix);
    console.log(query)
    sparql(this.api_url, query, (err, data) => {
      if (data && !err) {
        this.setState({
          data:data, 
          available_entities:d3.keys(data[0]),
          loaded: true
        });
      } else if (err) throw err;
    });
  }

  /**
   * generateLayout
   * Required for React-Grid to function well
   *
   * @param {object} Object containing the layout for each of the components
   * @return {object} Layout
   */
  generateLayout(l){
    return(d3.entries(l).map(x=>{
      const layout = x.value;
      layout['i'] = x.key;
      return layout;
    }));
  }

  /**
   * addComponent
   * Creates a new instance of a vis component and sets the state to have an instance of the new 
   * component, and a new layout for displaying it on the dashboard.
   *
   * @param {string} name Name to handle components internally.
   * @param {array} entities Array containing a subset of entities to handle in the vis component.
   * @param {string} type Name of the vis component. Should match a key in this.availableComponents.
   */
  addComponent(name, entities, type){
    if(!d3.keys(this.state.components).includes(name)){
      let newInstance = React.createElement(this.availableComponents[type],{},null)

      this.setState(prevState=>{
        prevState.layout[name] = {x: 0, y: 0, w: 2, h: 4, isDraggable:true};
        prevState.visComponents[name]={entities:entities,instance:newInstance};
        return prevState;
      });
    }
  }

  removeComponent(name){
    if(d3.keys(this.state.visComponents).includes(name)){
      this.setState(prevState=>{
        delete prevState.visComponents[name];
        delete prevState.layout[name];
        return prevState;
      });
    }
  }

  onLayoutChange(a){
    const newLayout = {};
    a.map(x=>{newLayout[x.i] = x});
    this.setState({layout: newLayout});
  }

  renderComponents(){
    // Display vis component intances through a wrapper class
    const visComponents = d3.entries(this.state.visComponents).map(c=>(
        <div key={c.key}>
          <VisWrapper width={this.state.layout[c.key].w * Math.trunc(document.body.clientWidth/6)- 25} 
                      height={this.state.layout[c.key].h * 90 + (this.state.layout[c.key].h - 1)*10 - 40}
                      name={c.key}
                      entities={c.value.entities}
                      data={this.state.data}
                      removeComponent={this.removeComponent}>
                      {c.value.instance}
          </VisWrapper>
        </div>
    ));

    // An extra component for selecting new vis components
    visComponents.push(
      <div key="selector" style={({display: this.state.loaded===true?'block':'none'})}>
        <VisSelectorWrapper width={this.state.layout.selector.w * Math.trunc(document.body.clientWidth/6) - 25} 
              height={this.state.layout.selector.h * 90 + (this.state.layout.selector.h - 1)*10 - 55}
              name={"Component Selector"}
              addComponent={this.addComponent}
              entities={this.state.available_entities}
              availableComponents={d3.keys(this.availableComponents)}>
              <ComponentSelector/>
        </VisSelectorWrapper>
      </div>
    );

    return(visComponents);
  }

  render(){
    const pretty_entities = this.state.available_entities.map(a=>this.wrapper.nameOfEntity(a)).join(' , ');

    return(<div id="explorer">
        <div className="header">
          <h2>Explorer page</h2>
          <div className="info">
            <div>
              <span>Ontology : {this.ontology}</span>
              <span>Sparql entry point : {this.api_url}</span>
            </div>
            <span>Current data available for entities : {pretty_entities}</span>
          </div>
        </div>
        <div className="content">
          <div className="loader" style={({display: this.state.loaded===true?'none':'block'})}></div>
          <div id="vis-container" width="100%" height="720">
            <ReactGridLayout
                layout={this.generateLayout(this.state.layout)}
                onLayoutChange={this.onLayoutChange}
                width={document.body.clientWidth}
                rowHeight={90}
                cols={6}
                className="layout"
                compactType={null}>
                {this.renderComponents()}
            </ReactGridLayout>
          </div>
        </div>
      </div>);
  }
}

export default Explorer; 