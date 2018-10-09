import React, { Component } from 'react'
import { hot } from 'react-hot-loader'
import { sparql } from 'd3-sparql'
import OverviewChart from './OverviewChart'

import './app.css'


const 	width = 1200,
		height = 420

const 	genderQuery = `	PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
					 	PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
					 	PREFIX foaf: <http://xmlns.com/foaf/0.1/>
					 	PREFIX oldcan: <https://explorations4u.acdh.oeaw.ac.at/ontology/oldcan#>
 
						Select ?questionnaire ?author ?title ?publicationYear ?lastName ?firstName  ?gender (COUNT(?question) as ?nQuestion) 
							from <http://exploreat.adaptcentre.ie/Questionnaire_graph>
							from <http://exploreat.adaptcentre.ie/Person_graph>
							from <http://exploreat.adaptcentre.ie/Question_graph>
						WHERE {
	  						?questionnaire oldcan:hasAuthor ?author.
	  						?questionnaire oldcan:title ?title.
	  						?questionnaire oldcan:publicationYear ?publicationYear. 
	  						?author oldcan:FirstName ?firstName.
	  						?author oldcan:LastName ?lastName.
	  						?author foaf:gender ?gender.
	  						?question oldcan:isQuestionOf ?questionnaire. 
						} GROUP BY ?questionnaire ?title ?publicationYear ?author ?gender ?lastName ?firstName`


class App extends Component {
	constructor(props) {
		super(props)

		this.state = {
			data: [],
		}
	}

	componentDidMount() {

		sparql(API_URL, genderQuery, (err, data) => {
			if (data && !err) {
				console.log(data)
				data = data.map(d => {
					d.fullName = d.firstName + ' ' + d.lastName
					d.number = d.questionnaire.substring(d.questionnaire.lastIndexOf('/') + 1)
					d.title = d.title.substring(d.title.lastIndexOf(':') + 1)
					d.nQuestion = parseInt(d.nQuestion)
					d.publicationYear = `${parseInt(d.publicationYear)}`
					return d
				})
				this.setState({ data: data}) 	
			} else if (err) throw err
		})
	}
	render() {
		if (this.state.data.length == 0) {
			return (
				<div className='column'>
					<p>Loading</p>
				</div>
			)
		}
		return  (
			<div className='column'>
				<OverviewChart data={this.state.data} size={[width, height]}>
				</OverviewChart>
			</div>
		)
			
	}
}

export default hot(module)(App)

