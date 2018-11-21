import * as d3 from 'd3';
/* parseOntologyJson
 * Class for parsing urls into params and viceversa to use them inside uris
 * Proper and valid URL Query Strings are described in https://tools.ietf.org/html/rfc3986#page-12
 * Reserved characters as of 29 of october, 2018 are:
        reserved    = gen-delims / sub-delims

        gen-delims  = ":" / "/" / "?" / "#" / "[" / "]" / "@"

        sub-delims  = "!" / "$" / "&" / "'" / "(" / ")" / "*" / "+" / "," / ";" / "="
 * */
function parseOntologyJson(json){
    const shorttenUriWithPrefix = (uri,base,prefix)=>(!uri.includes(base)?uri:`${prefix}:${uri.split('#')[1]}`);
    const ontology_parsed = {};

    ontology_parsed.prefixes = d3.entries(json)
        .filter(d=>d.key.includes('xmlns'))
        .map(d=>({prefix:d.key, uri:d.value}));
    ontology_parsed.fields = d3.keys(json).filter(d=>!d.includes('xmlns'))
            
    ontology_parsed.ontology_base = json['xml:base']?json['xml:base']:"not_defined";
    const base_fields = ontology_parsed.ontology_base.split('/');
    ontology_parsed.ontology_prefix = base_fields.length > 0?base_fields[base_fields.length-1]:"not_defined";

    const classes = ontology_parsed.fields.includes('rdfs:Class')?json['rdfs:Class']:[]
    classes.push(...ontology_parsed.fields.includes('owl:Class')?json['owl:Class']:[]);

    ontology_parsed.entities = [];
    ontology_parsed.relationships = [];

    classes.map(d=>{
        let entity = {}, relationship = {};
        const attributes = d3.keys(d);
        
        // Extraction of entity name and description
        entity.name =  shorttenUriWithPrefix(
            d['rdf:about'], 
            ontology_parsed.ontology_base, 
            ontology_parsed.ontology_prefix);

        if(attributes.includes('rdfs:comment'))
            entity.description = d['rdfs:comment'];

        ontology_parsed.entities.push(entity)

        // Extraction of inheritance relationships
        if(attributes.includes('rdfs:subClassOf')){
            const sub_classses = d['rdfs:subClassOf'].length == undefined?[d['rdfs:subClassOf']]:d['rdfs:subClassOf'];
            // Only interested in inheritance properties, not restrictions
            sub_classses.map(sc=>{
                let entry = d3.entries(sc)[0];
                if(entry.key == 'rdf:resource'){
                    relationship.source = entity.name;
                    relationship.relationship = 'rdfs:subClassOf';
                    relationship.target = shorttenUriWithPrefix(
                        entry.value, 
                        ontology_parsed.ontology_base, 
                        ontology_parsed.ontology_prefix);
                    relationship.value = 1;
                    ontology_parsed.relationships.push(relationship)
                }
            })
        }

    });

    console.log('parsed', ontology_parsed)

    return(ontology_parsed)
}

export default parseOntologyJson;