
import React from "react";
import { BrowserRouter as Route, NavLink } from "react-router-dom";

/**
 * Home
 * Component for the home screen.
 *
 * @param props
 * @return {React.Component} 
 */
const About = (props)=>{
    return(<div>
        <div id="about">
        <h3>DH Explorer </h3>
        <p>
            Use the application to retrieve and explore RDF data, from
            the point of view that an ontology provides.
        </p>
        <div>
            <h3>Working with the dashboard</h3>
            <p>
                Three steps are involved in the process of visually exploring data:
            </p>
            <ol>
                <li>Loading an ontology and choosing a SPARQL endpoint.</li>
                <li>Choosing the desired entities, selecting desired attributes from 
                    the selected entities and executing this visual query to retrieve 
                    the data.</li>
                <li>Creating visualizations by selecting attributes and/or aggregations,
                    and choosing from the proposed visualizations.</li>
            </ol>
            <h4>Retrieving the data</h4>
            <p>
                <i>The visualizations are created from the data retrieved with the visual query 
                created in this previous step.</i><br/><br/>

                The ontology is visually represented through a node-link diagram, in a similar 
                fashion as it can be seen in the web ontology visualizer <a href="http://vowl.visualdataweb.org/webvowl.html">
                WebVOWL</a>; entities (classes and subclasses) are represented by nodes, and relationships
                ammong these entities with links.<br/><br/>

                <img className="pageWidth" src="/public/step3.png"/>

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
                Once data has been retrieved, it is accessible to be explored in the dashboard.<br/>
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
                This is helpfull to increase readibility in the visualization.

            </p>
            <h5>Available visualizations</h5>
            <div id="visualizations">
                <div className="visualization">
                    <img src="/public/bar.svg"/>
                    <p>
                        <b>Bar chart</b><br/>
                        Used to visually represent distribution of aggregated data.<br/>
                        <span className="underline">Data used in the visualization</span>:<br/>
                        Aggregated variables, which have the count of occurrencies for each value of the aggregation term.<br/>
                        <span className="underline">Visual representation</span>:<br/>
                        Each of the different values of the variable used for aggregating has its own bar with a height
                        proportional to the occurencies count.<br/>
                        <span className="underline">Configuration</span>:<br/>
                        The available aggregations for representation can be cycled through by clicking on the names, and 
                        the order in which the values appear changed by clicking in the correspondant arrow of in the legend.

                            
                    </p>
                </div>
                <div className="visualization">
                    <img src="/public/pie.svg"/>
                    <p>
                        <b>Pie chart</b><br/>
                        Used to visually represent distribution of aggregated data.<br/>
                        <span className="underline">Data used in the visualization</span>:<br/>
                        Aggregated variables, which have the count of occurrencies for each value of the aggregation term.<br/>
                        <span className="underline">Visual representation</span>:<br/>
                        Each of the different values of the variable used for aggregating has its own section of the circle with a radious proportional to the occurencies count.<br/>
                        <span className="underline">Configuration</span>:<br/>
                        The available aggregations for representation can be cycled through by clicking on the names, and the order in which the values appear changed by clicking in the correspondant arrow of in the legend.
                            
                    </p>
                </div>
                <div className="visualization">
                    <img src="/public/circlepacking.svg"/>
                    <p>
                        <b>Circle-packing</b><br/>
                         Used to visually represent hierarchies.<br/>
                         <span className="underline">Data used in the visualization</span>:<br/>
                         Non aggregated variables, which each represent a category.<br/>
                         <span className="underline">Visual representation</span>:<br/>
                         Each circle represents a category so that circles within the same parent
                         circle share the same value for that category<br/>
                         <span className="underline">Configuration</span>:<br/>
                         The top-down order in which the variables appear is the order they will
                         be used for creating the levels.
                            
                    </p>
                </div>
                <div className="visualization">
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
                <div className="visualization">
                    <img src="/public/violinplot.svg"/>
                    <p>
                        <b>Violin plot</b><br/>
                        Allows to see the distribution of some numerical data.<br/>
                        <span className="underline">Data used in the visualization</span>:<br/>
                        A numerical attribute (usually an aggregation) which distribution is shown.<br/>
                        <span className="underline">Visual representation</span>:<br/>
                        The violin plot is a horizontally symetrical version of a turned density plot,
                        where the width is proportional to the amount of occurencies of that value of the aggregation.<br/>
                        <span className="underline">Configuration</span>:<br/>
                        The available aggregations for the representation can be cycled through by clicking on the names.
                            
                    </p>
                </div>
                <div className="visualization">
                    <img src="/public/jitterviolinplot.svg"/>
                    <p>
                        <b>Jitter violin plot</b><br/>
                        Allows to see the distribution of some data both in a global and a detailed perspective.<br/>
                        <span className="underline">Data used in the visualization</span>:<br/>
                        A numerical attribute (usually an aggregation) which distribution is shown.<br/>
                        <span className="underline">Visual representation</span>:<br/>
                        In the right side of the visualization, a violin plot allows to see what the distribution
                        for that count is, while the left side allows to see individual entities and identify outliers.<br/>
                        <span className="underline">Configuration</span>:<br/>
                        The available aggregations for the representation can be cycled through by clicking on the names.
                            
                    </p>
                </div>
                <div className="visualization">
                    <img src="/public/ppcc.svg"/>
                    <p>
                        <b>Parallel coordinates</b><br/>
                        Used to represent visually a large number of attributes for each of the available entries.<br/>
                        <span className="underline">Data used in the visualization</span>:<br/>
                        Non aggregated attributes which will determine each of the columns in the parallel coodinate visualization.<br/>
                        <span className="underline">Visual representation</span>:<br/>
                        A set of lines, each representing an entry, which cross through each of the columns at the correspondant height for its value for such attribute.<br/>
                        <span className="underline">Configuration</span>:<br/>
                        The attribute which is used for colouring can be selected by clicking in its name.
                            
                    </p>
                </div>
                <div className="visualization">
                    <img src="/public/streamgraph.svg"/>
                    <p>
                        <b>Streamgraph</b><br/>
                        Used to see how some aggregation changes along an non-aggregated variable.<br/>
                        <span className="underline">Data used in the visualization</span>:<br/>
                        One aggregation wich will determine the size of the lines, and a second not-aggregated variable which will be used to display the changes of that aggregation along an horizontal axis.<br/>
                        <span className="underline">Visual representation</span>:<br/>
                        A set of lines of varying width which represent a value of the variable used for aggregating. Each line will have a width proportional to the occurrencies count at each of the values of the horizontal axis.<br/>
                        <span className="underline">Configuration</span>:<br/>
                        The available aggregations for creating or distributing the lines can be cycled through by clicking on the names.
                            
                    </p>
                </div>
                <div className="visualization">
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
                <div className="visualization">
                    <img src="/public/bubblegraph.svg"/>
                    <p>
                        <b>Bubblegraph</b><br/>
                        Used to visually identify how the disrtibution of some aggregation changes with a second variable.<br/>
                        <span className="underline">Data used in the visualization</span>:<br/>
                        One aggregation wich will determine the size of the bubbles, and a second not-aggregated variable
                        which will be used to distribute and cluster the bubbles along an horizontal axis.<br/>
                        <span className="underline">Visual representation</span>:<br/>
                        A set of bubbles which represent a value for the variable used for aggregating, which size is
                        proportional to the number of occurencies. The bubbles are distributed along an horizontal axis based
                        on the value of the not-aggregated variable selected.<br/>
                        <span className="underline">Configuration</span>:<br/>
                        The available aggregations for creating or clustering the bubbles can be cycled through by clicking on
                        the names.
                            
                    </p>
                </div>
            </div>

            <h4>Use case</h4>
            This examples shows how a researcher could through the process of answering to the folowing question:<br/>
            <i className="padded">Which are the questions related to questionnaires about human-related topics that have been done by a woman researcher?</i>
            
            <div id="steps">
                <div className="step">
                    <img src="/public/step1.png"/>
                    <p>
                        <b>Step 1: Selecting the sources</b><br/>
                        The very first step for using the dashboard is selecting a local RDF schema, and
                        the SPARQL endpoint that will be used. These sources will be used both when selecting
                        the entities, and selecting the attributes.
                    </p>
                </div>
                <div className="step">
                    <img src="/public/step2.png"/>
                    <p>
                        <b>Step 2: Selecting the data</b><br/>
                        Now that we see the ontology, we can choose the classes that will be added
                        to the query. Probably Questionnaire and Author are the ones that will be needed.
                    </p>
                </div>
                <div className="step">
                    <img src="/public/step3.png"/>
                    <p>
                        <b>Step 3: Selecting the attributes</b><br/>
                        When these node are added to the it can be seen how all needed attributes
                        are already available. Once they are selected, the query is launched by clicking
                        on "Go to dashboard".
                    </p>
                </div>
                <div className="step">
                    <img src="/public/step-5.png"/>
                    <p>
                        <b>Step 4: The dashboard</b><br/>
                        When the data is retrieved, the avialable variables can be seen by clicking in the 
                        top "Show variables" options. These are the ones that will be used for answering the 
                        intial question.
                    </p>
                </div>
                <div className="step">
                    <img src="/public/step-6.png"/>
                    <p>
                        <b>Step 5: The questionnaire topics</b><br/>
                        Given that the topics will be explored, a bar chart where the amount of questionnaires 
                        for each of the topics can help give an idea of how they are distributed.<br/>
                        Once we have this, the next step will be filtering by the topic.
                    </p>
                </div>
                <div className="step">
                    <img src="/public/step-7.png"/>
                    <p>
                        <b>Step 6: Details of Human-related questionnaires</b><br/>
                        Once a filter is created, the visualizations update to show this sub set of information.
                        We can make use of table to see which are those questionnaires that are shown in the bar 
                        chart.
                    </p>
                </div>
                <div className="step">
                    <img src="/public/step-8.png"/>
                    <p>
                        <b>Step 7: Distribution of questionnaires according to gender</b><br/>
                        Part of the question involves filtering by gender. This could be done with the textual
                        search, although another type of filtering can be done: with click interactions in the
                        visualizations filters can be created. <br/>
                        For this, a pie chart with the number of questionnaires for each gender is created.
                    </p>
                </div>
                <div className="step">
                    <img src="/public/step-9.png"/>
                    <p>
                        <b>Step 8: The data</b><br/>
                        Clicking in the pie chart section associated with the female gender filters the data
                        and leaves the table with the entries for the questionnaires and questions that fit our 
                        filters.
                    </p>
                </div>
            </div>
        </div>
        </div>
      </div>);
}

export default About;
