import React, { Component } from 'react'
import { hot } from 'react-hot-loader'
import { sparql } from 'd3-sparql'

import OverviewChart from './OverviewChart'
import './App.css'


const 	width = 960,
		height = 500

const 	genderQuery = `	PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
					 	PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
					 	PREFIX foaf: <http://xmlns.com/foaf/0.1/>
					 	PREFIX oldcan: <https://explorations4u.acdh.oeaw.ac.at/ontology/oldcan#>
 
						Select ?questionnaire ?author ?lastName ?firstName  ?gender (COUNT(?question) as ?nQuestion) 
							from <http://exploreat.adaptcentre.ie/Questionnaire_graph>
							from <http://exploreat.adaptcentre.ie/Person_graph>
							from <http://exploreat.adaptcentre.ie/Question_graph>
						WHERE {
	  						?questionnaire oldcan:hasAuthor ?author.
	  						?author oldcan:FirstName ?firstName.
	  						?author oldcan:LastName ?lastName.
	  						?author foaf:gender ?gender.
	  						?question oldcan:isQuestionOf ?questionnaire. 
						} GROUP BY ?questionnaire ?author ?gender ?lastName ?firstName`

const questEndpoint = 'http://localhost:3030/dboe/query'


class App extends Component {
	constructor(props) {
		super(props)

		this.state = {
			data: [],
		}
	}

	componentDidMount() {
		sparql(questEndpoint, genderQuery, (err, data) => {
			if (err) throw err
			this.setState({ data: data}) 
		})
	}

	render() {
		return <OverviewChart data={this.state.data} size={[width, height]}/>
	}
}

export default hot(module)(App)

