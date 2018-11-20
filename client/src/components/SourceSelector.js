import React from "react";
import { BrowserRouter as Route, NavLink } from "react-router-dom";
import * as d3 from 'd3';
import UrlParamWrapper from '../aux/UrlParamWrapper';

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
            ontology_file:"",
            ontology:"",
            ontology_from_file : true
        };

        this.wrapper = new UrlParamWrapper();
        this.handleOntologyUrlChange = this.handleOntologyUrlChange.bind(this);
        this.handlePrefixChange = this.handlePrefixChange.bind(this);
        this.handleSparqlChange = this.handleSparqlChange.bind(this);
        this.parseOntology = this.parseOntology.bind(this);
        this.handleOntologyFileChange = this.handleOntologyFileChange.bind(this);
        this.toggleOntologySource = this.toggleOntologySource.bind(this);
        this.loadFileOntolgy = this.loadFileOntolgy.bind(this);
        this.loadUrlOntology = this.loadUrlOntology.bind(this);

    }

    parseOntology(){
        const ontology_promise = (this.state.ontology_from_file===true)?this.loadFileOntolgy():this.loadUrlOntology();
        ontology_promise.then((ontology=>{
            const options = {ignoreAttributes:false, attrValueProcessor:attr=>attr, attributeNamePrefix : ""};
            const ontology_json = xmlparser.parse(ontology,options)['rdf:RDF'];
            const claves = d3.keys(ontology_json).filter(d=>!d.includes('xmlns'))
            
            const ontology_base = ontology_json['xml:base']?ontology_json['xml:base']:"";

            let clases = claves.includes('rdfs:Class')?ontology_json['rdfs:Class']:[]
            clases.push(...claves.includes('owl:Class')?ontology_json['owl:Class']:[]);

            clases = clases.map(d=>{
                let entry = {};
                const attributes = d3.keys(d);
                
                entry.name = (!d['rdf:about'].includes(ontology_base)?
                    d['rdf:about']:
                    `${this.state.prefix}:${d['rdf:about'].split('#')[1]}`);

                if(attributes.includes('rdfs:comment'))
                    entry.description = d['rdfs:comment'];
                
                if(attributes.includes('rdfs:subClassOf'))
                    entry.herency = d['rdfs:subClassOf'];

                return(entry);
            });


            console.log(`Atributos de primer nivel para ${ontology_json['xml:base']} > `, clases)
            
            this.setState({ontology: ontology_json})
        }));
    }

    loadFileOntolgy(){
        return(new Promise((resolve, reject)=>{
            const fr = new FileReader()
            fr.onload = function(e) {
                resolve(e.target.result)
            }

            fr.readAsText(this.state.ontology_file);
        }));
    }

    loadUrlOntology(){
        return(new Promise((resolve, reject)=>{
            const url = `http://${window.location.hostname}:8080/api/resource/${this.wrapper.urlToParam(this.state.ontology_url)}`;
            window.fetch(url).then(data=>resolve(data));
        }));
    }

    handleOntologyFileChange(event){
        this.setState({ontology_file: event.target.files[0]})
    }
     
	handleOntologyUrlChange(event){
		this.setState({ontology_url: event.target.value});
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
			"/explorer/ontology/"+
			this.wrapper.urlToParam(this.state.ontology_url)+
			"/prefix/"+
			this.wrapper.urlToParam(this.state.prefix)+
			"/sparql/"+
			this.wrapper.urlToParam(this.state.sparql);

	    return (
	    	<div id="source_selector">
		      	<form>
                    <span style={{display:this.state.ontology_from_file===true?'inherit':'none'}}>
                        <label>
                          Ontology file:
                          <input id="uploadInput" type="file" name="myFiles" onChange={this.handleOntologyFileChange}/>
                        </label>
                        <p onClick={()=>this.toggleOntologySource()}>Load from url</p>
                    </span>

                    <span style={{display:this.state.ontology_from_file===false?'inherit':'none'}}>
                        <label>
                          Url to ontology:
                          <input type="text" value={this.state.ontology_url} onChange={this.handleOntologyUrlChange} />
                        </label>
                        <p onClick={()=>this.toggleOntologySource()}>Load from file</p>
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
                <p onClick={this.parseOntology}>parse</p>
	      	</div>
	    );
	}
}	

export default SourceSelector;
