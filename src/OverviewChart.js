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

  	createOverviewChart() {
  		if (this.props.data.length == 0) return 
  		const { data, size } = this.props
  		const node = d3.select(this.node)
  		
  		const xOffset = 200
				
		const xScale = d3.scalePoint()
						.domain(["Male", "Female"])
						.range([xOffset, size[0] - xOffset])
		const foci = {
			"Male" : {
				"x" : xScale("Male"),
				"y" : size[1] / 2 
			},
			"Female": {
				"x" : xScale("Female"),
				"y" : size[1] / 2
			}
		}

		console.log(foci["Male"].x, foci["Female"].x)


		const forceX = d3.forceX().x((d) => foci[d.gender].x)
		const forceY = d3.forceY().y((d) => foci[d.gender].y)

		const radiusScale = d3.scaleLinear()
						.domain(d3.extent(data, d => parseInt(d.nQuestion)))
						.range([5, 10])



		const xAxis = d3.axisBottom().scale(xScale)

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

		node.append('g').attr('transform', `translate(0, ${size[1] - 50})`).attr('id', 'xAxisG').call(xAxis)



		const force = d3.forceSimulation(data)
						// .velocityDecay(0.65)
						.force('x', forceX)
						.force('y', forceY)
						.force('collide', d3.forceCollide(12))

		force.nodes(data)
			.on('tick', function() {
				circles
					.attr('transform', d => {
						return `translate(${d.x}, ${d.y})`
					})
		})
    	
  	}

	render() {
		return <svg ref={node => this.node = node} width={this.props.size[0]} height={this.props.size[1]}>
		</svg>
	}
}


export default OverviewChart
