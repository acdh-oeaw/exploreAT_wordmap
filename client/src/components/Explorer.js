import React from "react";
import { BrowserRouter as Route, NavLink } from "react-router-dom";
import UrlParamWrapper from '../aux/UrlParamWrapper';
import RGL, { WidthProvider } from "react-grid-layout";
const ReactGridLayout = WidthProvider(RGL);
import Dummy from './vis/Dummy'
import VisWrapper from './vis/VisWrapper'
import * as d3 from 'd3';

import gridStyleLayout from '../../node_modules/react-grid-layout/css/styles.css';
import gridStyleResizable from '../../node_modules/react-resizable/css/styles.css';

class Explorer extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      data : [],
      loaded:false,
      layout: {
        'alex': {x: 0, y: 0, w: 2, h: 4, isDraggable:true},
        'antonio': {x: 3, y: 0, w: 2, h: 4, isDraggable:true},
      },
      visComponents: {
        alex: React.createElement(Dummy,{},null),
        antonio: React.createElement(Dummy,{},null),
      }
    }      
     
    this.availableComponents = {
      "Dummy": Dummy
    };
    this.wrapper = new UrlParamWrapper();
    this.onLayoutChange = this.onLayoutChange.bind(this);
    this.addComponent = this.addComponent.bind(this);
    this.removeComponent = this.removeComponent.bind(this);
  }

  generateLayout(l){
    return(d3.entries(l).map(x=>{
      const layout = x.value;
      layout['i'] = x.key;
      return layout;
    }));
  }

  addComponent(name, type){
    if(!d3.keys(this.state.components).includes(name)){
      let newInstance = React.createElement(this.availableComponents[name],{},null)

      this.setState(prevState=>(prevState.visComponents[name]=newInstance));
    }
  }

  removeComponent(name){
    if(d3.keys(this.state.components).includes(name)){
      this.setState(prevState=>{
        delete prevState.visComponents[name];
        return prevState;
    }
  }

  onLayoutChange(a){
    const newLayout = {};
    a.map(x=>{newLayout[x.i] = x});
    this.setState({layout: newLayout});
  }

  render(){
    const pretty_entities = this.wrapper.paramToUrl(this.props.match.params.entities);

    const visComponents = d3.entries(this.state.visComponents).map(c=>(
      <div key={c.key}>
        <VisWrapper width={this.state.layout[c.key].w * Math.trunc(document.body.clientWidth/6)- 10} 
                    height={this.state.layout[c.key].h * 90 + (this.state.layout[c.key].h - 1)*10}
                    name={c.key}>
                    {c.value}
        </VisWrapper>
      </div>
    ));

    return(<div id="explorer">
        <div className="header">
          <h2>Explorer page</h2>
          <ul>
            <li>Ontology : {this.wrapper.paramToUrl(this.props.match.params.ontology)}</li>
            <li>Sparql entry point : {this.wrapper.paramToUrl(this.props.match.params.sparql)}</li>
          </ul>
          <ul>
            <li>Current data available from entities :</li>
            <li>{pretty_entities}</li>
          </ul>
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
                {visComponents.length>0?visComponents:""}
            </ReactGridLayout>
          </div>
        </div>
      </div>);
  }
}

export default Explorer; 