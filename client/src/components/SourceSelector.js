import React from "react";
import { BrowserRouter as Route, NavLink } from "react-router-dom";
import * as d3 from 'd3';
import UrlParamWrapper from '../aux/UrlParamWrapper';
import parseOntologyJson from '../aux/OntologyParser'

const xmlparser = require('fast-xml-parser');

/**
 * Explorer
 * Component for the initial exploration screen. Ontology url and prefix, 
 * and the SPARQL database endpoints are obtained here.
 *
 * @param props
 * @return {React.Component} 
 */
class SourceSelector extends React.Component{
    constructor(props){
        super(props);
        this.state={
            prefix:"oldcan",
            sparql:"http://localhost:3030/oldcan/query",
            ontology_url:"https://explorations4u.acdh.oeaw.ac.at/ontology/oldcan",
            ontology:"https://explorations4u.acdh.oeaw.ac.at/ontology/oldcan",
            ontology_from_file : false,
        };

        this.wrapper = new UrlParamWrapper();
        this.handleOntologyUrlChange = this.handleOntologyUrlChange.bind(this);
        this.handlePrefixChange = this.handlePrefixChange.bind(this);
        this.handleSparqlChange = this.handleSparqlChange.bind(this);
        this.handleOntologyFileChange = this.handleOntologyFileChange.bind(this);
        this.toggleOntologySource = this.toggleOntologySource.bind(this);

    }

    handleOntologyFileChange(event){
        console.log(event.target.files[0])
        
        function parseOntology(ontology_raw){
            const options = {ignoreAttributes:false, attrValueProcessor:attr=>attr, attributeNamePrefix : ""};
            const ontology_json = xmlparser.parse(ontology_raw,options);
            const ontology_parsed = parseOntologyJson(ontology_json);
            return(ontology_parsed);
        }

        const fr = new FileReader()
        fr.onload = (e)=> console.log(parseOntology(e.target.result));

        fr.readAsText(event.target.files[0]);
    }
     
	handleOntologyUrlChange(event){
		this.setState({ontology_url: event.target.value, Ontology:event.target.value})
	};

	handleSparqlChange(event){
		this.setState({sparql: event.target.value});
	};

	handlePrefixChange(event){
		this.setState({prefix: event.target.value});
	};

    toggleOntologySource(){
        this.setState(prevState=>{
            prevState.ontology_from_file = !prevState.ontology_from_file;
            return(prevState);
        });
    }

	render() {
		const url = 
			"/explorer/file/"+
            this.state.ontology_from_file+
            "/ontology/"+
            this.wrapper.urlToParam(this.state.ontology)+
            "/prefix/"+
            this.wrapper.urlToParam(this.state.prefix)+
            "/sparql/"+
            this.wrapper.urlToParam(this.state.sparql);

	    return (
	    	<div id="source_selector">
		      	<form>
                    <span style={{display:this.state.ontology_from_file===true?'inherit':'none', marginBottom:'29px'}}>
                        <label id="extra-label">
                          Ontology file <span className="toggleSource" onClick={()=>this.toggleOntologySource()}>(or load from url)</span> :
                        </label>
                        <label>
                          <input id="uploadInput" type="file" name="myFiles" onInput={this.handleOntologyFileChange}/>
                        </label>
                    </span>

                    <span style={{display:this.state.ontology_from_file===false?'inherit':'none'}}>
                        <label>
                          Url to ontology <span className="toggleSource" onClick={()=>this.toggleOntologySource()}>(or load from local file)</span> :<br/>
                          <input type="text" value={this.state.ontology_url} onChange={this.handleOntologyUrlChange} />
                        </label>
                    </span>
                    
			        <label>
			          Prefix for the ontology:
			          <input type="text" value={this.state.prefix} onChange={this.handlePrefixChange} />
			        </label>
			        <label>
			          Sparql endpoint:
			          <input type="text" value={this.state.sparql} onChange={this.handleSparqlChange} />
			        </label>
		      	</form>
                <NavLink to={url} style={
                    (this.state.ontology.length>0 && this.state.sparql.length>0 && this.state.prefix.length>0)?{display:"block"}:{display:"none"}
                }>Go</NavLink>
	      	</div>
	    );
	}
}	

export default SourceSelector;
