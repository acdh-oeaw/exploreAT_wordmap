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
}

export default SparqlQueryBuilder;