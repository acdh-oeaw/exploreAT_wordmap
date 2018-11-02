import React from "react";
import { BrowserRouter as Route, NavLink } from "react-router-dom";
import UrlParamWrapper from '../aux/UrlParamWrapper';
import RGL, { WidthProvider } from "react-grid-layout";
const ReactGridLayout = WidthProvider(RGL);
import Dummy from './vis/Dummy'
import VisWrapper from './vis/VisWrapper'
import ComponentSelector from './vis/ComponentSelector'
import * as d3 from 'd3';

import gridStyleLayout from '../../node_modules/react-grid-layout/css/styles.css';
import gridStyleResizable from '../../node_modules/react-resizable/css/styles.css';

class Explorer extends React.Component{
  constructor(props){
    super(props);    
     
    this.availableComponents = {
      "Dummy": Dummy
    };
    this.wrapper = new UrlParamWrapper();
    this.onLayoutChange = this.onLayoutChange.bind(this);
    this.addComponent = this.addComponent.bind(this);
    this.removeComponent = this.removeComponent.bind(this);

    this.state = {
      data : [],
      loaded:false,
      layout: {
        'selector': {x: 0, y: 0, w: 2, h: 4, isDraggable:true},
      },
      visComponents: {
      }
    }  
  }

  generateLayout(l){
    return(d3.entries(l).map(x=>{
      const layout = x.value;
      layout['i'] = x.key;
      return layout;
    }));
  }

  addComponent(name, entity, type){
    if(!d3.keys(this.state.components).includes(name)){
      let newInstance = React.createElement(this.availableComponents[type],{},null)

      this.setState(prevState=>{
        prevState.layout[name] = {x: 0, y: 0, w: 2, h: 4, isDraggable:true};
        prevState.visComponents[name]={entity:entity,instance:newInstance};
        prevState.loaded = true;
        return prevState;
      });
    }
  }

  removeComponent(name){
    if(d3.keys(this.state.visComponents).includes(name)){
      console.info('removing the : ',name)
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
    console.log(this.state)
    const pretty_entities = this.wrapper.paramToUrl(this.props.match.params.entities)
      .split(',').map(a=>a.split('#')[1]).join(' , ');

    const visComponents = d3.entries(this.state.visComponents).map(c=>(
        <div key={c.key}>
          <VisWrapper width={this.state.layout[c.key].w * Math.trunc(document.body.clientWidth/6)- 15} 
                      height={this.state.layout[c.key].h * 90 + (this.state.layout[c.key].h - 1)*10 - 40}
                      name={c.key}
                      entity={c.value.entity}
                      removeComponent={this.removeComponent}>
                      {c.value.instance}
          </VisWrapper>
        </div>
    ));

    visComponents.push(
      <div key="selector">
        <VisWrapper width={this.state.layout.selector.w * Math.trunc(document.body.clientWidth/6) - 20} 
              height={this.state.layout.selector.h * 90 + (this.state.layout.selector.h - 1)*10 - 45}
              name={"Component Selector"}
              addComponent={this.addComponent}
              entities={this.wrapper
                  .paramToUrl(this.props.match.params.entities)
                  .split(',')}
              availableComponents={d3.keys(this.availableComponents)}>
              <ComponentSelector/>
        </VisWrapper>
      </div>
    );

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
                {visComponents}
            </ReactGridLayout>
          </div>
        </div>
      </div>);
  }
}

export default Explorer; 