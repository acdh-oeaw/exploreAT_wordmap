import React from "react";
import * as d3 from 'd3';
import { sparql } from 'd3-sparql'
import gridStyleLayout from '../../node_modules/react-grid-layout/css/styles.css';
import gridStyleResizable from '../../node_modules/react-resizable/css/styles.css';
import { BrowserRouter as Route, NavLink } from "react-router-dom";
import RGL, { WidthProvider } from "react-grid-layout";
import UrlParamWrapper from '../aux/UrlParamWrapper';

import Dummy from './vis/Dummy'
import ComponentSelector from './vis/ComponentSelector'
import VisWrapper from './vis/VisWrapper'
import VisSelectorWrapper from './vis/VisSelectorWrapper'
import Table from './vis/Table'

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
     
    this.availableComponents = {
      "Dummy": Dummy,
      "Table": Table
    };
    this.wrapper = new UrlParamWrapper();
    this.onLayoutChange = this.onLayoutChange.bind(this);
    this.addComponent = this.addComponent.bind(this);
    this.removeComponent = this.removeComponent.bind(this);

    this.state = {
      data : null,
      available_entities:[],
      loaded:false,
      layout: {
        'selector': {x: 0, y: 0, w: 2, h: 4, isDraggable:true},
      },
      visComponents: {
      }
    }  

    // Url query param based parameters
    this.api_url = this.wrapper.paramToUrl(this.props.match.params.sparql);
    this.ontology = this.wrapper.paramToUrl(this.props.match.params.ontology);
    this.prefix = this.wrapper.paramToUrl(this.props.match.params.prefix);
    this.entries = this.wrapper.paramToUrl(this.props.match.params.entities).split(',');
  }

  componentDidMount(){
    const query = this.createDataSparqlQuery();
    const graphFromEntry = (e)=>e.split('+')[0];
    const entityFromEntry = (e)=>e.split('+')[1];
    const nameOfEntity = (e)=>(e.slice(Math.max(...[
      e.lastIndexOf('/'),
      e.lastIndexOf('#'),
      e.lastIndexOf(':'),
    ])+1));

    sparql(this.api_url, query, (err, data) => {
      if (data && !err) {
        this.setState({data:data, available_entities:this.entries.map(e=>nameOfEntity(entityFromEntry(e)))});
      } else if (err) throw err;
    });
  }

  /**
   * createDataSparqlQuery
   * Provides a query for retrieving data for all of the entities passed from EntitySelector screen
   *
   * @return {string} An SPARQL query
   */
  createDataSparqlQuery(){
    let queries_per_graph = {};
    const s = "abcdefghijklmnopqrstuvwxyz";
    const graphFromEntry = (e)=>e.split('+')[0];
    const entityFromEntry = (e)=>e.split('+')[1];
    const nameOfEntity = (e)=>(e.slice(Math.max(...[
      e.lastIndexOf('/'),
      e.lastIndexOf('#'),
      e.lastIndexOf(':'),
    ])+1));

    this.entries.map(e=>{
      if(!queries_per_graph[graphFromEntry(e)])
        queries_per_graph[graphFromEntry(e)]=[entityFromEntry(e),];
      else
        queries_per_graph[graphFromEntry(e)].push(entityFromEntry(e))
    });

    let query = "PREFIX "+ this.prefix + ": <"+ this.ontology + "#>";
    query += "\n SELECT " + this.entries.map(e=>"?"+nameOfEntity(entityFromEntry(e))).join(' ')+"\n"
    query += d3.keys(queries_per_graph).map(g=>"FROM <"+g+">").join("\n");
    query += "WHERE {\n"+d3.entries(queries_per_graph).map((entry,i)=>{
      const subject = s[i];
      const lines = entry.value.map(e=>"?"+subject+" "+((e.search('http://')!=-1)?('<'+e+'>'):e)+" ?"+nameOfEntity(e)+" .").join("\n");
      return(lines);
    }).join("\n");
    query += "\n}\nLIMIT 100"

    return(query);
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
        prevState.loaded = true;
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

  render(){
    const entityFromEntry = (e)=>e.split('+')[1];
    const nameOfEntity = (e)=>(e.slice(Math.max(...[
      e.lastIndexOf('/'),
      e.lastIndexOf('#'),
      e.lastIndexOf(':'),
    ])+1));
    const pretty_entities = this.entries.map(a=>nameOfEntity(entityFromEntry(a))).join(' , ');

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
      <div key="selector">
        <VisSelectorWrapper width={this.state.layout.selector.w * Math.trunc(document.body.clientWidth/6) - 20} 
              height={this.state.layout.selector.h * 90 + (this.state.layout.selector.h - 1)*10 - 45}
              name={"Component Selector"}
              addComponent={this.addComponent}
              entities={this.state.available_entities}
              availableComponents={d3.keys(this.availableComponents)}>
              <ComponentSelector/>
        </VisSelectorWrapper>
      </div>
    );

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
                {visComponents}
            </ReactGridLayout>
          </div>
        </div>
      </div>);
  }
}

export default Explorer; 