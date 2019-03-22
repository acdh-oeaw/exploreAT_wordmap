import React from "react";
import { BrowserRouter as Route, NavLink } from "react-router-dom";

/**
 * Home
 * Component for the home screen.
 *
 * @param props
 * @return {React.Component} 
 */
const Home = (props)=>{
    return(<div id="home">
        <h3>exploreAT! DH Dashboard</h3>
        <h5>Visually exploring RDF data from the perspective of an ontology</h5>
        <h5>
            Query a SPARQL endpoint using an ontology schema as a reference<br/>
            and build a visual dashboard to see the underlying information.<br/>
        </h5>
        <div className="banner">
            <img src="/public/step3.png"/>
            <img src="/public/step-8.png"/>
            <NavLink to="/entities"><h2>Start the app</h2></NavLink>
        </div>
        <h5>
            This application is a result framed in the project “exploreAT! - exploring<br/>
            austria’s culture through the language glass”. The project runs within an Open<br/>
            Innovation framework and aims at leveraging cultural knowledge by providing<br/>
            unique insights into the German language in Austria.
        </h5>
        <div id="logo-container">
            <img id="exploreat" src="/public/square_logo.png"/>
            <img id="visusal" src="/public/visusal.png"/>
            <img id="usal" src="/public/usal.jpg"/>
            <img id="acdh" src="/public/acdh.png"/>
            <img id="oeaw" src="/public/oeaw.png"/>
        </div>
      </div>);
}

export default Home;
