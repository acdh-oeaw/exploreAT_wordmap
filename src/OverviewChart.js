import React, { Component } from 'react';
import * as d3 from 'd3'


class OverviewChart extends Component {

	constructor(props){
    	super(props)
    	this.createOverviewChart = this.createOverviewChart.bind(this)
  	}

	componentDidMount() {
    	this.createOverviewChart()
  	}

  	componentDidUpdate() {
    	this.createOverviewChart()
  	}


  	getConfig(keyName) {
  		const { data, size } = this.props

  		const xOffset = 200

		const xScale = d3.scalePoint()
							.domain(d3.map(data, d => d[keyName]).keys())
							.range([xOffset, size[0] - xOffset])

		console.log(xScale("Female"), xScale("Male"))
		const xAxis = d3.axisBottom().scale(xScale)
		
		const forceX = d3.forceX().x((d) => xScale(d[keyName]))
		const forceY = d3.forceY().y((d) => size[1] / 2)
		
		return { 
			xScale: xScale,
			xAxis: xAxis,
			forceX: forceX,
			forceY: forceY
		}
  	}

  	createOverviewChart() {
  		if (this.props.data.length == 0) return 

  		const { data, size } = this.props
  		
  		const node = d3.select(this.node)
  		

		const radiusScale = d3.scaleLinear()
						.domain(d3.extent(data, d => parseInt(d.nQuestion)))
						.range([4, 15])

		const config = this.getConfig("gender")


		const namesSet = new Set(data.map(d => d.firstName + ' ' + d.lastName))
		console.log(namesSet);

		const circles = node.append('g')
						// .attr('transform', `translate(${xOffset}, 0)`)
						.attr('class', 'circles')
						.selectAll('circle')
						.data(data)
						.enter().append("circle")
						.attr("r", d=> radiusScale(parseInt(d.nQuestion)))
						.attr("fill", d => d.gender == "Female" ? "red" : "blue")

		node.append('g').attr('transform', `translate(0, ${size[1] - 50})`).attr('id', 'xAxisG').call(config.xAxis)



		const force = d3.forceSimulation(data)
						// .velocityDecay(0.65)
						.force('x', config.forceX)
						.force('y', config.forceY)
						.force('collide', d3.forceCollide(15))

		force.nodes(data)
			.on('tick', function() {
				circles
					.attr('transform', d => {
						return `translate(${d.x}, ${d.y})`
					})
		})
    	
  	}

	render() {
		return (
		<div>
			<select id="idns" defaultValue="gender">
				<option value="gender">gender</option>
				<option value="author">author</option>
			</select>
			<svg ref={node => this.node = node} width={this.props.size[0]} height={this.props.size[1]}>
			</svg>
		</div>)

	}
}


export default OverviewChart
