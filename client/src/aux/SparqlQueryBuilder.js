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

    shorttenURIwithPrefix(ontology, prefix, uri){
        return(uri.includes(ontology)===false?uri:prefix + ":" + uri.split(ontology+"#")[1])
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
     * getAvailableEntities
     * Provides a SPARQL query for retrieving all entities in the database, and their 
     * size.
     *  
     *
     * @param {string} ontology - An ontology related to the case of study.
     * @param {string} prefix - All entities and relationships will make use of it
        to reduce the amount of characters used.
     * @return {string} the SPARQL query, keys: entity, count.
     */
    getAvailableEntities(ontology, prefix){
        return(
        `
        PREFIX ${prefix}: <${ontology}#>
        SELECT DISTINCT ?entity (count(?h) as ?count)
        WHERE {  
          GRAPH ?g {?h <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?entity}
        }group by ?entity
        `
        );
    }

    /**
     * getEntityRelationships
     * Provides a SPARQL query for retrieving all relationships in the database
     *
     *
     * @param {string} ontology - An ontology related to the case of study.
     * @param {string} prefix - All entities and relationships will make use of it
        to reduce the amount of characters used.
     * @return {string} the SPARQL query, keys: entity, relationship, to.
     */
    getEntityRelationships(ontology, prefix){
        return(
        `
        PREFIX ${prefix}: <${ontology}#>
        SELECT distinct ?entity ?relationship ?to WHERE {  
          {SELECT ?entity ?o ?relationship WHERE{
              {SELECT DISTINCT ?entity WHERE {  GRAPH ?g {?h <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?entity}}}.
              GRAPH ?g {?f ?x ?entity}.
                GRAPH ?g {?f ?relationship ?o}.
            }
          }.
          GRAPH ?g {?o <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?to}
        }
        `
        );
    }

    /**
     * getEntityAttributes
     * Provides a SPARQL query for retrieving all attributes of a specific entity in the database
     *
     *
     * @param {string} ontology - An ontology related to the case of study.
     * @param {string} prefix - All entities and relationships will make use of it
        to reduce the amount of characters used.
     * @param {string} entity - The entity of which to retrieve the attributes
     * @return {string} the SPARQL query, keys: entity, relationship, to.
     */
    getEntityAttributes(ontology, prefix, entity){
        return(
        `
        PREFIX ${prefix}: <${ontology}#>
        SELECT DISTINCT ?attribute
        WHERE {
          GRAPH ?g {?subject <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ${entity}}.
          GRAPH ?g {?subject ?attribute ?object}.
        }

        LIMIT 25
        `
        );
    }

    createDataSparqlQuery(ontology, prefix, triples){
        const elements = triples.reduce((final,actual)=>final.concat(actual.split(" ")), []);
        const graphs = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

        let query = "";
        query +=` PREFIX ${prefix}: <${ontology}#>\n`;
        query += 'SELECT '+elements.filter(e=>e.includes('?')).join(' ');
        query += '\nWHERE{ \n';
        query += triples.map((triple,i)=>`  GRAPH ?${graphs[i]} {${triple}}.\n`).join('');
        query += '}limit 100';

        return(query);
    }

    /**
     * createDataSparqlQuery
     * Provides a query for retrieving data for all of the entities passed from EntitySelector screen
     *
     * @param {array} entries An array of strings containing the full URI of each pair of (graph - prefix).
     * @param {string} ontology Ontology that is going to be used for the database exploration.
     * @param {string} prefix Prefix used for the ontology.
     * @return {string} An SPARQL query
    
    createDataSparqlQuery(entries, ontology, prefix){
        const wrapper = new UrlParamWrapper();
        let queries_per_graph = {};
        const p = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        entries.map(e=>{
            if(!queries_per_graph[wrapper.graphFromEntry(e)])
                queries_per_graph[wrapper.graphFromEntry(e)]=[wrapper.entityFromEntry(e),];
            else
                queries_per_graph[wrapper.graphFromEntry(e)].push(wrapper.entityFromEntry(e))
        });

        let s = d3.keys(queries_per_graph).map(e=>e.split('/')[e.split('/').length-1]);
        s = s.map(e=>e.split('_')[0]);

        const selection = s.map(e=>" ?"+e).join("") + 
            entries.map(e=>"?"+wrapper.nameOfEntity(wrapper.entityFromEntry(e))).join(' ');

        let query = "PREFIX "+ prefix + ": <"+ ontology + "#>";
        query += "\n SELECT " + selection + "\n";
        query += " (COUNT(?"+s[0]+") as ?n) \n"
        query += d3.keys(queries_per_graph).map(g=>"FROM <"+g+">").join("\n");
        query += "\nWHERE {\n"+(()=>{
            let lines = "";
            for(let i=0; i<d3.keys(queries_per_graph).length-1;i++)
                lines += "\nOPTIONAL{?" + s[i] + " ?" + p[i] + " ?" + s[i+1] +"}.";
            return(lines);
        })();
        query += "\n"+d3.entries(queries_per_graph).map((entry,i)=>{
            let lines = entry.value.map(e=>"?"+s[i]+" "+((e.search('http://')!=-1)?('<'+e+'>'):e)+" ?"+wrapper.nameOfEntity(e)+" .").join("\n");
            return(lines);
        }).join("\n");
        query += "\n}GROUP BY"+selection+"\nLIMIT 100"

        return(query);
    } */

    oldQuery(){
        return(
            `   PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
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
            );
    }
}

export default SparqlQueryBuilder;