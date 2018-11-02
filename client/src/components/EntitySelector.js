import React from "react";
import { BrowserRouter as Route, NavLink } from "react-router-dom";
import UrlParamWrapper from '../aux/UrlParamWrapper';
import * as d3 from 'd3';

class EntitySelector extends React.Component{
	constructor(props){
		super(props);
		this.state={
			entities: [],
			current_search: "",
			loaded: false,
			ontology:[],
		};

		this.wrapper = new UrlParamWrapper();
		this.toggleEntitySelection = this.toggleEntitySelection.bind(this);
		this.handleFilterChange = this.handleFilterChange.bind(this);
	}

	componentDidMount(){
		//const url = 'http://'+window.location.hostname+':8080/api/resource/'+this.props.match.params.ontology;
		const url = 'http://rdf-translator.appspot.com/convert/xml/json-ld/'+
			this.wrapper.safeParamToStandarParam(this.props.match.params.ontology);
		d3.json(url).then(data=>{
			const filtered = data['@graph'].filter(d=>{
					if(typeof(d['@type']) == 'string'){
						//console.log('string', d, (['owl:Class','rdfs:Class'].includes(d['@type'])));
						return(['owl:Class','rdfs:Class'].includes(d['@type']));
					}
					if(typeof(d['@type']) == 'object'){
						//console.log('array', d, (d['@type'].includes('owl:Class')));
						return(d['@type'].includes('owl:Class'));
					}
				});
			this.setState({
				loaded:true, 
				ontology:filtered});
		});
	}

	componentDidUpdate(prevProps, prevState, snapshot){
		if(prevState.loaded===false && this.state.loaded===true && this.state.ontology!=[]){
			console.log('ontology loaded', this.state.ontology)
		}
	}

	toggleEntitySelection(entity){
		this.setState((prevState)=>{
			if(entity && entity.length>0)
				if(prevState.entities.includes(entity))
					prevState.entities = prevState.entities.filter(e=>e!=entity)
				else
					prevState.entities.push(entity)
			return(prevState);
		});
	};

	handleFilterChange(event){
		this.setState({current_search: event.target.value});
	};

	render() {
		const url = 
			"/explorer/ontology/"+
			this.props.match.params.ontology+
			"/sparql/"+
			this.props.match.params.sparql+
			"/entities/"+
			this.state.entities.map(e=>this.wrapper.urlToParam(e)).join(",");

		const filtered = (entity)=>(this.state.current_search!="" && entity.search(this.state.current_search)==-1);
		const style = (entity)=>({"fill":filtered(entity)===true?"lightgrey":"#18bc9c"});
		const action = (entity)=>(filtered(entity)===false?this.toggleEntitySelection(entity):()=>{});

		const entities = this.state.ontology.map((e,i)=>(
			<g key={e['@id']} onClick={()=>action(e['@id'])} transform={"translate("+(10 + 40*(i%10))+", "+(10 + 17*i)+")"}>
				<circle style={style(e['@id'])} cx={5} cy={5} r={10}></circle>
				<text style={style(e['@id'])} y={9} x={17}>{e['@id']}</text>
			</g>
			
		));

		const pretty_entities = this.state.entities.join(' , ');

	    return (
	    	<div id="explorer" className="entitySelector">
		        <div className="header">
		          <h2>Entity selection</h2>
		          <ul>
		            <li>Ontology : {this.wrapper.paramToUrl(this.props.match.params.ontology)}</li>
		            <li>Sparql entry point : {this.wrapper.paramToUrl(this.props.match.params.sparql)}</li>
		          </ul>
		          <ul>
		            <li>Current select entities :</li>
		            <li>> { pretty_entities }</li>
		          </ul>
		          <ul>
		            <li>Search for specific entities :</li>
		            <li><input type="text" value={this.state.current_search} onChange={this.handleFilterChange} /></li>
		          </ul>
		        </div>
		        <div className="loader" style={({display: this.state.loaded===true?'none':'block'})}></div>
		        <div className="content">
					<svg ref={node => this.svg = node} width={'100%'} height={'100%'}>
						{entities}
					</svg>
			      	<NavLink to={url} style={
			      		(this.state.entities.length>0)?{display:"block"}:{display:"none"}
			      	}>Go</NavLink>
		        </div>
		    </div>
	    );
	}
}	

export default EntitySelector;