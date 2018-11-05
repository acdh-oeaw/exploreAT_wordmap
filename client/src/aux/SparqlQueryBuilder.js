import * as d3 from 'd3';
import UrlParamWrapper from './UrlParamWrapper';
/* UrlParamWrapper
 * Class for parsing urls into params and viceversa to use them inside uris
 * Proper and valid URL Query Strings are described in https://tools.ietf.org/html/rfc3986#page-12
 * Reserved characters as of 29 of october, 2018 are:
        reserved    = gen-delims / sub-delims

        gen-delims  = ":" / "/" / "?" / "#" / "[" / "]" / "@"

        sub-delims  = "!" / "$" / "&" / "'" / "(" / ")" / "*" / "+" / "," / ";" / "="
 * */
class SparqlQueryBuilder{
    constructor(){

    }

    /**
     * getGraphsQuery
     * Provides a SPARQL query for retrieving available graphs.
     *
     * @return {string} The query.
     */
    getGraphsQuery(){
        return(
        `
        SELECT ?graph
        WHERE {
          GRAPH ?graph { }
        }`);
    }
        
    /**
     * getEntitiesOverviewQuery
     * Provides a SPARQL query for retrieving all entities and count for a graph.
     *
     * @param {string} URI for the graph it is intended to query for.
     * @return {string} The query.
     */
    getEntitiesOverviewQuery(graph_uri){
        return(
        `
        SELECT DISTINCT ?object (count (?subject) as ?count)
        from <`+graph_uri+`>
        WHERE {
            ?subject <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?object.
        }group by ?object
        `);
    }

    /**
     * getEntitiesDetailQuery
     * Provides a SPARQL query to retirieve all predicates available in a graph.
     *
     * @param {string} URI for the graph it is intended to query for.
     * @return {string} The query.
     */
    getEntitiesDetailQuery(graph_uri){
        return(
        `
        SELECT ?object ?predicates ?count
        FROM <`+graph_uri+`>
        WHERE{
            {SELECT DISTINCT ?object 
             WHERE {?subject <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?object}} .
            {SELECT (GROUP_CONCAT(DISTINCT ?predicate; SEPARATOR=",") AS ?predicates) (COUNT(DISTINCT ?predicate) AS ?count) 
            WHERE {?subject ?predicate []}}
        }
        limit 60
        `);
    }

    /**
     * createDataSparqlQuery
     * Provides a query for retrieving data for all of the entities passed from EntitySelector screen
     *
     * @param {array} entries An array of strings containing the full URI of each pair of (graph - prefix).
     * @param {string} ontology Ontology that is going to be used for the database exploration.
     * @param {string} prefix Prefix used for the ontology.
     * @return {string} An SPARQL query
     */
    createDataSparqlQuery(entries, ontology, prefix){
        const wrapper = new UrlParamWrapper();
        let queries_per_graph = {};
        const s = "abcdefghijklmnopqrstuvwxyz";

        entries.map(e=>{
            if(!queries_per_graph[wrapper.graphFromEntry(e)])
                queries_per_graph[wrapper.graphFromEntry(e)]=[wrapper.entityFromEntry(e),];
            else
                queries_per_graph[wrapper.graphFromEntry(e)].push(wrapper.entityFromEntry(e))
        });

        let query = "PREFIX "+ prefix + ": <"+ ontology + "#>";
        query += "\n SELECT " + entries.map(e=>"?"+wrapper.nameOfEntity(wrapper.entityFromEntry(e))).join(' ')+"\n"
        query += d3.keys(queries_per_graph).map(g=>"FROM <"+g+">").join("\n");
        query += "WHERE {\n"+d3.entries(queries_per_graph).map((entry,i)=>{
            const subject = s[i];
            const lines = entry.value.map(e=>"?"+subject+" "+((e.search('http://')!=-1)?('<'+e+'>'):e)+" ?"+wrapper.nameOfEntity(e)+" .").join("\n");
            return(lines);
        }).join("\n");
        query += "\n}\nLIMIT 100"

        return(query);
    }
}

export default SparqlQueryBuilder;