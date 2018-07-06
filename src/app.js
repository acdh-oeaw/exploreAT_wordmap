import * as d3 from 'd3'
import { sparql } from 'd3-sparql'

import './app.css'

const 	width = 960,
		height = 500,
		padding = 1.5

const genderQuery = `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
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

sparql(questEndpoint, genderQuery, (err, data) => {
	if (err) throw err
	console.log(data)
	const svg = d3.select('#root')
				.append('svg')
				.attr('width', width)
				.attr('height', height)
				
	console.log(svg)

	const xScale = d3.scaleOrdinal()
					.domain([0, 1])
					.range([300, width - 300])
	const foci = {
		"Male" : {
			"x" : xScale(0),
			"y" : height / 2 
		},
		"Female": {
			"x" : xScale(1),
			"y" : height / 2
		}
	}

	const forceX = d3.forceX((d) => foci[d.gender].x)
	const forceY = d3.forceY((d) => foci[d.gender].y)

	const radiusScale = d3.scaleLinear()
					.domain(d3.extent(data, d => parseInt(d.nQuestion)))
					.range([5, 10])
	console.log(radiusScale(60))

	const node = svg.append('g')
					.attr('class', 'nodes')
					.selectAll('circle')
					.data(data)
					.enter().append("circle")
					.attr("r", d=> radiusScale(parseInt(d.nQuestion)))
					.attr("fill", d => d.gender == "Female" ? "red" : "blue")

	const force = d3.forceSimulation(data)
					.velocityDecay(0.65)
					.force('x', forceX)
					.force('y', forceY)
					.force('collide', d3.forceCollide(12))

	force.nodes(data)
		.on('tick', function() {
			node
				.attr('transform', d => {
					return `translate(${d.x}, ${d.y})`
				})
		})


})
