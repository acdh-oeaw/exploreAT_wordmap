import React from "react";
import { BrowserRouter as Route, NavLink } from "react-router-dom";
import UrlParamWrapper from '../aux/UrlParamWrapper';
import RGL, { WidthProvider } from "react-grid-layout";
const ReactGridLayout = WidthProvider(RGL);
import Dummy from './vis/Dummy'
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
        'dummy': {x: 0, y: 0, w: 1, h: 2, isDraggable:true},
      }
    }
    this.wrapper = new UrlParamWrapper();
    this.onLayoutChange = this.onLayoutChange.bind(this);
  }

  generateLayout(l){
    return(d3.entries(l).map(x=>{
      const layout = x.value;
      layout['i'] = x.key;
      return layout;
    }));
  }

  onLayoutChange(a){
    const newLayout = {};
    a.map(x=>{newLayout[x.i] = x});
    this.setState({layout: newLayout});
  }

  render(){
    const pretty_entities = this.wrapper.paramToUrl(this.props.match.params.entities);

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
                <div key="dummy">
                  <Dummy
                    width={this.state.layout.dummy.w * Math.trunc(document.body.clientWidth/6)} 
                    height={this.state.layout.dummy.h * 90 + (this.state.layout.dummy.h - 1)*10}/>           
                </div>
            </ReactGridLayout>
          </div>
        </div>
      </div>);
  }
}

export default Explorer; 