import React, { Component } from 'react';
import * as d3 from 'd3'
import d3tip from 'd3-tip'
import Select from 'react-select'
import SearchField from 'react-search-field'



const options = [
	{ value: 'gender', label: 'Gender' },
	{ value: 'author', label: 'Author' },
	{ value: 'publication_year', label: 'Publication Year' },
]

const optionsMap = {
	'gender' : 'gender',
	'author' : 'fullName',
	'publication_year' : 'publicationYear'
}

const xOffset = 180


class OverviewChart extends Component {

	constructor(props){
    	super(props)

    	this.state = {
    		selectedOption: options[0],
    		xAxis: d3.axisBottom(),
    		xScale: d3.scalePoint(),
    		forceX: d3.forceX(),
    		forceY: d3.forceY(),
    		simulation: d3.forceSimulation(),
    		searchTerm: '',
    	}

    	this.createOverviewChart = this.createOverviewChart.bind(this)
    	this.updateChart = this.updateChart.bind(this)
    	this.updateHighlights = this.updateHighlights.bind(this)
    	this.handleSelectChange = this.handleSelectChange.bind(this)
    	this.handleSearchChange = this.handleSearchChange.bind(this)
  	}

  	handleSelectChange(selectedOption) {
  		console.log('handleSelectChange')
  		this.setState({ selectedOption })
  		console.log(`Option selected:`, selectedOption);
  	}

  	handleSearchChange(value, event) {
  		console.log(value);
  		this.updateHighlights(value)
  	}

	componentDidMount() {
    	this.createOverviewChart()
  	}

  	componentDidUpdate() {
  		console.log('componentDidUpdate')
  		this.updateChart()
  	}


  	updateConfig() {
  		console.log('updateConfig')
  		const { data, size } = this.props
  		const { selectedOption } = this.state

  		

		this.state.xScale
				.domain(d3.map(data, d => d[optionsMap[selectedOption.value]]).keys().sort())
				.range([xOffset, size[0] - xOffset])

		this.state.xAxis.scale(this.state.xScale)
		
		this.state.forceX.x((d) => this.state.xScale(d[optionsMap[selectedOption.value]]))
		this.state.forceY.y((d) => size[1] / 2)
		
  	}

  	createOverviewChart() {
  		console.log('createOverviewChart')
  		if (this.props.data.length == 0) return 

  		this.updateConfig()
  		const { data, size } = this.props
  		
  		const node = d3.select(this.node)
  		

		const radiusScale = d3.scaleLinear()
						.domain(d3.extent(data, d => parseInt(d.nQuestion)))
						.range([4, 15])

		const tip = d3tip().attr('class', 'd3-tip').html(d => {
															return `<p>Questionnaire ${d.number}</p>
																	<p>${d.title}</p>
																	<p>${d.nQuestion} questions</p>
																	<p>${d.fullName}</p>
																	<p>Published in ${d.publicationYear}</p>`
														})

		node.call(tip)

		const circles = node.append('g')
						// .attr('transform', `translate(${xOffset}, 0)`)
						.attr('class', 'circles')
						.selectAll('circle')
						.data(data)
						.enter().append("circle")
						.attr("r", d=> radiusScale(parseInt(d.nQuestion)))
						.attr("fill", d => d.gender == "Female" ? "red" : "blue")
						.on('mouseover', tip.show)
  						.on('mouseout', tip.hide)

		node.append('g').attr('transform', `translate(0, ${size[1] - 50})`).attr('id', 'xAxisG').call(this.state.xAxis)



		this.state.simulation
						.velocityDecay(0.3)
						.force('x', this.state.forceX)
						.force('y', this.state.forceY)
						.force('collide', d3.forceCollide(15))

		this.state.simulation.nodes(data)
			.on('tick', function() {
				circles
					.attr('transform', d => {
						return `translate(${d.x}, ${d.y})`
					})
		})
    	
  	}


  	updateChart() {
  		this.updateConfig()
  		const t = d3.transition().duration(500)
  		d3.select(this.node).select("#xAxisG").transition(t).call(this.state.xAxis)

  		this.state.simulation
  				.force('x', this.state.forceX)
				.force('y', this.state.forceY)
		this.state.simulation.alpha(1).restart()
  	
  	}

  	updateHighlights(searchTerm) {
  		const t = d3.transition().duration(500)
  		console.log('updateHighlights')
  		d3.select(this.node).selectAll('circle').style('opacity', d => d.title.indexOf(searchTerm) == -1 ? 0.2 : 1)
  	}

	render() {
		console.log('render')
		let { selectedOption } = this.state 

		return (
		<div id='container'>
			<SearchField 
				placeholder='Search title'
				onChange={this.handleSearchChange}
			/>
			<svg ref={node => this.node = node} width={this.props.size[0]} height={this.props.size[1]}>
			</svg>
			<Select
				id='idns'
				value={selectedOption}
				onChange={this.handleSelectChange}
				options={options}
			/>
		</div>)

	}
}


export default OverviewChart
