const d3 = require('d3');
const UrlParamWrapper = require('./UrlParamWrapper');
/* UrlParamWrapper
 * Class for parsing urls into params and viceversa to use them inside uris
 * Proper and valid URL Query Strings are described in https://tools.ietf.org/html/rfc3986#page-12
 * Reserved characters as of 29 of october, 2018 are:
        reserved    = gen-delims / sub-delims

        gen-delims  = ":" / "/" / "?" / "#" / "[" / "]" / "@"

        sub-delims  = "!" / "$" / "&" / "'" / "(" / ")" / "*" / "+" / "," / ";" / "="
 * */
module.exports = {

    getAvailableEntities: function(){
        return(
        `
        SELECT DISTINCT ?entity (count(?h) as ?count)
        WHERE {  
          GRAPH ?g {?h <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?entity}
        }group by ?entity
        `
        );
    },

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
    getEntityRelationships: function(){
        return(
        `
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
    },

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
    getEntityAttributes: function(ontology, prefix, entity){
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

}
