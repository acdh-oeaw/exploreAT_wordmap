import React from "react";
import { BrowserRouter as Router, Route, NavLink } from "react-router-dom";
import { Switch } from 'react-router';
import { hot } from 'react-hot-loader';
import EntitySelector from './EntitySelector';
import Home from './Home';
import Help from './Help';
import Explorer from './Explorer';

/**
 * App
 * Main component for the dashboard. Routes are handled by the app.
 *
 * @param props
 * @return {React.Component} 
 */
class App extends React.Component {
  constructor(props){
    super(props);
    this.ontology = null;
    this.sparql = "";
    this.setEntitySelectionSources = this.setEntitySelectionSources.bind(this);
    this.getEntitySelectionSources = this.getEntitySelectionSources.bind(this);
  }

  setEntitySelectionSources(ontology, sparql){
    this.ontology = ontology;
    this.sparql = sparql;
  }

  getEntitySelectionSources(){
    return({
      ontology: this.ontology,
      sparql: this.sparql
    });
  }

  render(){
    return (
      <Router>
        <div id="app">
          <div id="header">
            <div>
              <div>
                <a href="https://www.oeaw.ac.at/acdh/projects/exploreat/" target="blank"><img src="/public/square_logo.png"></img></a>
                <h3>Novel interactive visual tools for open-linked data</h3>
              </div>
              <div id="links">
                <NavLink to="/">Home</NavLink>
                <NavLink to="/entities">App</NavLink>
                <NavLink to="/help">Help</NavLink>
              </div>
            </div>
          </div>

          <div className="content">
            <Switch>
              <Route exact path="/" component={Home}/>
              <Route exact path="/help" component={Help}/>
              <Route exact path="/entities/" 
                  render={(props) => <EntitySelector {...props} 
                      setEntitySelectionSources={this.setEntitySelectionSources}
                      getEntitySelectionSources={this.getEntitySelectionSources}
                    />}
                />
              <Route exact path="/explorer/prefixes/:prefixes/sparql/:sparql/entities/:entities" component={Explorer}/>
              <Route component={Home}/>
            </Switch>
          </div>

          <div id="footer">
            ExploreAT! DH Dashboard. Application done in the contexto of the <a target="blank" href="https://www.oeaw.ac.at/acdh/projects/exploreat/">ExploreAT! project.</a><br/>
            Code for the application can be found at <a href="https://github.com/acdh-oeaw/exploreat-dh-dashboard">
                {"https://github.com/acdh-oeaw/exploreat-dh-dashboard"}</a>
          </div>
          
        </div>
      </Router>
    
    );
  }
}

export default hot(module)(App)
