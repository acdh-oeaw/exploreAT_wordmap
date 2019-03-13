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
        <h2>ExploreAT DH Dashboard</h2>

        <div className="banner">
            <img src="/public/step3.png"/>
            <img src="/public/step-9.png"/>
            <NavLink to="/entities"><h2>Start the app</h2></NavLink>
        </div>
      </div>);
}

export default Home;
