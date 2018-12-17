import React from "react";
import * as d3 from 'd3';
import { sparql } from 'd3-sparql';
import gridStyleLayout from '../../node_modules/react-grid-layout/css/styles.css';
import gridStyleResizable from '../../node_modules/react-resizable/css/styles.css';
import { BrowserRouter as Route, NavLink } from "react-router-dom";
import RGL, { WidthProvider } from "react-grid-layout";
import * as crossfilter from 'crossfilter2';

import UrlParamWrapper from '../aux/UrlParamWrapper';
import ComponentSelector from './vis/ComponentSelector';
import VisSelectorWrapper from './vis/VisSelectorWrapper';
import VisWrapper from './vis/VisWrapper';
import Table from './vis/Table';
import PackedBubbles from './vis/PackedBubbles';
import PieChart from './vis/PieChart';
import BarChart from './vis/BarChart';
import SparqlQueryBuilder from '../aux/SparqlQueryBuilder';
import ParallelCoordinates from './vis/ParallelCoordinates';

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
      filterChanged: false,
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
    this.prefixes = this.wrapper.paramToUrl(this.props.match.params.prefixes).split(',').map(d=>({prefix:d.split('+')[0],uri:d.split('+')[1]}));
    this.triples = this.wrapper.paramToUrl(this.props.match.params.entities).split(',').filter(d=>d!="");
    this.updateFilteredData = this.updateFilteredData.bind(this);
    this.renderComponents = this.renderComponents.bind(this);
    this.availableComponents = {"Table": Table, "Pie Chart": PieChart, "Bar Chart":BarChart, "Parallel Coordinates": ParallelCoordinates};
  }

  componentDidMount(){
    let query = this.sparqlQueries.createDataSparqlQuery(this.prefixes, this.triples);    
    sparql(this.api_url, query, (err, data) => {
      if (data && !err) {
        let state = {
          data: data,
          crossfilter: crossfilter(data),
          available_entities:d3.keys(data[0]),
          filters: {},
          loaded: true
        }
        d3.keys(data[0]).map(d=>state.filters[d]=state.crossfilter.dimension(x=>x[d]));
        console.log(state, this.updateFilteredData);
        this.setState(state);
      } else if (err) throw err;
    });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if(this.state.loaded == true && prevState.filterChanged == false && this.state.filterChanged == true ){
      this.setState({
        data: this.state.crossfilter.allFiltered(),
        filterChanged: false
      })
    }  
    console.log(this.state.data)
  }

  updateFilteredData(){
    this.setState({filterChanged: true});
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
   * @param {array} attributes Array containing a subset of attributes to handle in the vis component.
   * @param {string} type Name of the vis component. Should match a key in this.availableComponents.
   */
  addComponent(name, attributes, type){
    if(!d3.keys(this.state.components).includes(name)){
      let newInstance = React.createElement(this.availableComponents[type],{},null)

      this.setState(prevState=>{
        prevState.layout[name] = {x: 0, y: 0, w: 2, h: 4, isDraggable:true};
        prevState.visComponents[name]={attributes:attributes,data:this.state.data,instance:newInstance};
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
          <VisWrapper width={this.state.layout[c.key].w * Math.trunc(document.body.clientWidth/6)- 15} 
                      height={this.state.layout[c.key].h * 90 + (this.state.layout[c.key].h - 1)*10 - 30}
                      name={c.key}
                      attributes={c.value.attributes}
                      data={this.state.data}
                      filters={this.state.filters}
                      updateFilteredData={this.updateFilteredData}
                      removeComponent={this.removeComponent}>
                      {c.value.instance}
          </VisWrapper>
        </div>
    ));

    // An extra component for selecting new vis components
    visComponents.push(
      <div key="selector" style={({display: this.state.loaded===true?'block':'none'})}>
        <VisSelectorWrapper width={this.state.layout.selector.w * Math.trunc(document.body.clientWidth/6) - 25} 
              height={this.state.layout.selector.h * 90 + (this.state.layout.selector.h - 1)*10 - 30}
              name={"Component Selector"}
              addComponent={this.addComponent}
              entities={this.state.available_entities}
              data={this.state.data}
              filters={this.state.filters}
              updateFilteredData={this.updateFilteredData}
              availableComponents={d3.keys(this.availableComponents)}>
              <ComponentSelector/>
        </VisSelectorWrapper>
      </div>
    );

    return(visComponents);
  }

  render(){
    return(<div id="explorer">
        <div className="header">
          <h2>Explorer page</h2>
          <div className="info">
              <span>Ontologies referenced : {this.prefixes.map(p=>p.prefix).join(', ')}</span>
              <span>Sparql entry point : {this.api_url}</span>
              <span onClick={()=>alert(this.state.available_entities.map(e=>`${e}\n`))} style={{cursor:'pointer'}}>Show variables </span>
          </div>
        </div>
        <div className="content">
          <div className="loader" style={({display: this.state.loaded===true?'none':'block'})}></div>
          <div id="vis-container" width="100%" height="720">
            <ReactGridLayout
                layout={this.generateLayout(this.state.layout)}
                onLayoutChange={this.onLayoutChange}
                width={document.body.clientWidth}
                draggableCancel="input,textarea"
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