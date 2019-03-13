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
    return(<div>
        <h2>Home page</h2>
        <div id="about">
        <h3>DH Explorer </h3>
        <p>
            Use the application to retrieve and explore RDF data, from
            the point of view that an ontology provides.
        </p>
        <div>
            <h3>Working with the dashboard</h3>
            <p>
                Three steps are involved in he process of visually exploring data:
                <ol>
                    <li>Load an ontology and choose a SPARQL endpoint.</li>
                    <li>Choose the desired entities, select desired attributes from 
                        the selected entities, execute this visual query to retrieve 
                        the data.</li>
                    <li>Create visualizations by selecting attributes and/or aggregations,
                        and choosing from the proposed visualizations.</li>
                </ol>
            </p>
            <h4>Retrieving the data</h4>
            <p>
                <i>The visualizations are created from the data retrieved with the visual query 
                created in this previous step.</i><br/><br/>

                The ontology is visually represented through a node-link diagram, in a similar 
                fashion as it can be seen in the web ontology visualizer <a href="http://vowl.visualdataweb.org/webvowl.html">
                WebVOWL</a>; entities (classes and subclasses) are represented by nodes, and relationships
                ammong these entities with links.<br/><br/>

                <b>The nodes and links that are selected are the classes and relationships that will be
                retrieved.</b><br/><br/>

                As nodes are selected, the accessible nodes are shown with the connecting link blue-higlighted.
                Therefore, more nodes can be added by clicking in the connecting edge once the initial node
                has been added.<br/><br/>

                These nodes are shown in the bottom part, where their attributes are shown and can be added 
                with click interactions. Therefore, this bottom part shows in green the visual query that will 
                launched to the SPARQL endpoint.
            </p>
            
            <h4>Creating visualizations</h4>
            <p>
                Once data has been retrieved, it is accesible to be explored in the dashboard.<br/>
                A set of visualizations are available to be added to the dashboard.
            </p>
            <p>
                Having multiple visualizations allows to see the same data from different perspectives,
                and filter the data in order to gain insight and understanding of the data.<br/>
                Each visualization has a description which can be accessed through the help button, and
                disposed by clicking on the close button.<br/><br/>
                Visualizations reside in its own window, which can be dragged around in the working 
                space in order to arrange the dashboard as best works for the specific task performed at
                each moment.<br/>
                Additionally, the window of a visualization can be resized by dragging the bottom-right corner.
                This is helpfull to increase readibility in the visualiztion.

            </p>
            <h5>Available visualizations</h5>
            <div id="visualizations">
                <div class="visualization">
                    <img src="/public/bar.svg"/>
                    <p>
                        <b>Bar chart</b><br/>
                        Used to visually represent distribution of aggregated data.<br/>
                        <span class="underline">Data used in the visualization</span>:<br/>
                        Aggregated variables, which have the count of occurrencies for each value of the aggregation term.<br/>
                        <span class="underline">Visual representation</span>:<br/>
                        Each of the different values of the variable used for aggregating has its own bar with a height
                        proportional to the occurencies count.<br/>
                        <span class="underline">Configuration</span>:<br/>
                        The available aggregations for representation can be cycled through by clicking on the names, and 
                        the order in which the values appear changed by clicking in the correspondant arrow of in the legend.

                            
                    </p>
                </div>
                <div class="visualization">
                    <img src="/public/pie.svg"/>
                    <p>
                        <b>Pie chart</b><br/>
                        Used to visually represent distribution of aggregated data.<br/>
                        <span class="underline">Data used in the visualization</span>:<br/>
                        Aggregated variables, which have the count of occurrencies for each value of the aggregation term.<br/>
                        <span class="underline">Visual representation</span>:<br/>
                        Each of the different values of the variable used for aggregating has its own section of the circle with a radious proportional to the occurencies count.<br/>
                        <span class="underline">Configuration</span>:<br/>
                        The available aggregations for representation can be cycled through by clicking on the names, and the order in which the values appear changed by clicking in the correspondant arrow of in the legend.
                            
                    </p>
                </div>
                <div class="visualization">
                    <img src="/public/circlepacking.svg"/>
                    <p>
                        <b>Circle-packing</b><br/>
                         Used to visually represent hierarchies.<br/>
                         <span class="underline">Data used in the visualization</span>:<br/>
                         Non aggregated variables, which each represent a category.<br/>
                         <span class="underline">Visual representation</span>:<br/>
                         Each circle represents a category so that circles within the same parent
                         circle share the same value for that category<br/>
                         <span class="underline">Configuration</span>:<br/>
                         The top-down order in which the variables appear is the order they will
                         be used for creating the levels.
                            
                    </p>
                </div>
                <div class="visualization">
                    <img src="/public/filter.svg"/>
                    <p>
                        <b>Filter</b><br/>
                        Textual search and filters can be done on any available variable of the retrieved 
                        data. These textual searchs are accumulated, enabling to reduce the number of analyzed 
                        entries at a moment.<br/>
                        This component can be used as way to reduce cardinality of the aggregations and make 
                        use of visualizations that have constraints, such as a bar chart with a manageable amount
                        of bars instead of the unfiltered amount of groups.
                    </p>
                </div>
                <div class="visualization">
                    <img src="/public/violinplot.svg"/>
                    <p>
                        <b>Violin plot</b><br/>
                        Allows to see the distribution of some numerical data.<br/>
                        <span class="underline">Data used in the visualization</span>:<br/>
                        A numerical attribute (usually an aggregation) which distribution is shown.<br/>
                        <span class="underline">Visual representation</span>:<br/>
                        The violin plot is a horizontally symetrical version of a turned density plot,
                        where the width is proportional to the amount of occurencies of that value of the aggregation.<br/>
                        <span class="underline">Configuration</span>:<br/>
                        The available aggregations for the representation can be cycled through by clicking on the names.
                            
                    </p>
                </div>
                <div class="visualization">
                    <img src="/public/jitterviolinplot.svg"/>
                    <p>
                        <b>Jitter violin plot</b><br/>
                        Allows to see the distribution of some data both in a global and a detailed perspective.<br/>
                        <span class="underline">Data used in the visualization</span>:<br/>
                        A numerical attribute (usually an aggregation) which distribution is shown.<br/>
                        <span class="underline">Visual representation</span>:<br/>
                        In the right side of the visualization, a violin plot allows to see what the distribution
                        for that count is, while the left side allows to see individual entities and identify outliers.<br/>
                        <span class="underline">Configuration</span>:<br/>
                        The available aggregations for the representation can be cycled through by clicking on the names.
                            
                    </p>
                </div>
                <div class="visualization">
                    <img src="/public/ppcc.svg"/>
                    <p>
                        <b>Parallel coordinates</b><br/>
                        Used to represent visually a large number of attributes for each of the available entries.<br/>
                        <span class="underline">Data used in the visualization</span>:<br/>
                        Non aggregated attributes which will determine each of the columns in the parallel coodinate visualization.<br/>
                        <span class="underline">Visual representation</span>:<br/>
                        A set of lines, each representing an entry, which cross through each of the columns at the correspondant height for its value for such attribute.<br/>
                        <span class="underline">Configuration</span>:<br/>
                        The attribute which is used for colouring can be selected by clicking in its name.
                            
                    </p>
                </div>
                <div class="visualization">
                    <img src="/public/streamgraph.svg"/>
                    <p>
                        <b>Streamgraph</b><br/>
                        Used to see how some aggregation changes along an non-aggregated variable.<br/>
                        <span class="underline">Data used in the visualization</span>:<br/>
                        One aggregation wich will determine the size of the lines, and a second not-aggregated variable which will be used to display the changes of that aggregation along an horizontal axis.<br/>
                        <span class="underline">Visual representation</span>:<br/>
                        A set of lines of varying width which represent a value of the variable used for aggregating. Each line will have a width proportional to the occurrencies count at each of the values of the horizontal axis.<br/>
                        <span class="underline">Configuration</span>:<br/>
                        The available aggregations for creating or distributing the lines can be cycled through by clicking on the names.
                            
                    </p>
                </div>
                <div class="visualization">
                    <img src="/public/table.svg"/>
                    <p>
                        <b>Table</b><br/>
                        Raw entries retrieved form the SPARQL endpoint can ve seen in this visualization. The table allows to see
                        details regarding certain data that can not be seen in other visualizations.<br/>
                        The tabkle shows a cropped version of the data where uris are not shown completely, but the last part; 
                        additionally, the full uri can be seen when the data is hovered. This allows to ease the reading 
                        of data as RDF data is based on uris.
                    </p>
                </div>
                <div class="visualization">
                    <img src="/public/bubblegraph.svg"/>
                    <p>
                        <b>Bubblegraph</b><br/>
                        Used to visually identify how the disrtibution of some aggregation changes with a second variable.<br/>
                        <span class="underline">Data used in the visualization</span>:<br/>
                        One aggregation wich will determine the size of the bubbles, and a second not-aggregated variable
                        which will be used to distribute and cluster the bubbles along an horizontal axis.<br/>
                        <span class="underline">Visual representation</span>:<br/>
                        A set of bubbles which represent a value for the variable used for aggregating, which size is
                        proportional to the number of occurencies. The bubbles are distributed along an horizontal axis based
                        on the value of the not-aggregated variableselected.<br/>
                        <span class="underline">Configuration</span>:<br/>
                        The available aggregations for creating or clustering the bubbles can be cycled through by clicking on
                        the names.
                            
                    </p>
                </div>
            </div>

            <h4>Examples</h4>

        </div>
        </div>
      </div>);
}

export default Home;
