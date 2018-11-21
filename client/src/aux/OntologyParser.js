import * as d3 from 'd3';
/* parseOntologyJson
 * Una función que toma por entrada un json con la ontología y devuelve un objeto con el siguiente
 * formato :
 ontology_parsed
 \_
  _
  _
  _
  _
  _
  _
  _
  _
  _ 

 * */
function parseOntologyJson(json){
    const shorttenUriWithPrefix = (uri,base,prefix)=>(!uri.includes(base)?uri:`${prefix}:${uri.split('#')[1]}`);
    const ontology_parsed = {};

    // Prefixes for external referenced ontologies
    ontology_parsed.prefixes = d3.entries(json)
        .filter(d=>d.key.includes('xmlns'))
        .map(d=>({prefix:d.key, uri:d.value}));
    ontology_parsed.fields = d3.keys(json).filter(d=>!d.includes('xmlns'))
            
    // Base uri and prefix for the current ontology
    ontology_parsed.ontology_base = json['xml:base']?json['xml:base']:"not_defined";
    const base_fields = ontology_parsed.ontology_base.split('/');
    ontology_parsed.ontology_prefix = base_fields.length > 0?base_fields[base_fields.length-1]:"not_defined";

    // Entity and inheritance extraction
    const classes = ontology_parsed.fields.includes('rdfs:Class')?json['rdfs:Class']:[]
    classes.push(...ontology_parsed.fields.includes('owl:Class')?json['owl:Class']:[]);

    ontology_parsed.entities = [];
    ontology_parsed.relationships = [];
    ontology_parsed.attributes = [];
    ontology_parsed.non_classified_attributes = [];

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

    // Attribute extraction
    // En owl DatatypeProperty define los tipos de datos que estarán accesibles en la
    // ontología. rdf:about tiene el nombre del atributo, si existe un rdfs:domain, entonces
    // sabremos qué entidades tienen ese atributo. Si no, no podemos más que saber que existe
    if(ontology_parsed.fields.includes('owl:DatatypeProperty')){
        json['owl:DatatypeProperty'].map(attr=>{
            if(attr['rdf:about']){
                const entry = {
                    attr: shorttenUriWithPrefix(
                            attr['rdf:about'], 
                            ontology_parsed.ontology_base, 
                            ontology_parsed.ontology_prefix)
                }; 
                if(attr['rdfs:domain']){
                    const domain = attr['rdfs:domain'].length == undefined?[attr['rdfs:domain']]:attr['rdfs:domain'];
                    domain.map(d=>{
                        entry.source = shorttenUriWithPrefix(
                                d['rdf:resource'], 
                                ontology_parsed.ontology_base, 
                                ontology_parsed.ontology_prefix);
                        
                        ontology_parsed.attributes.push(entry)
                    });
                }else
                    ontology_parsed['non_classified_attributes'].push(entry)
            }
        });
    }
/*
    // En owl 
    if(ontology_parsed.fields.includes('owl:ObjectProperty')){
        ontology_parsed['owl:ObjectProperty'].map(attr=>{
            
        });
    }

    // En rdf Property define todas las propiedades que las entidades tienen. Bien attributos o 
    // relaciones entre entidades definidas en la ontología. Para todas las entradas existen los
    // campos rdf:about con el nombre. Si incluye un campo rdfs:domain entonces podemos asignarle 
    // el atributo a una entidad en concreto; si tiene el atributo rdfs:range y el rdf:resource no
    // es una entidad entonces es un atributo y si no, una relación
    if(ontology_parsed.fields.includes('rdf:Property')){
        ontology_parsed['rdf:Property'].map(attr=>{
            
        });
    }

    console.log(json)

    // */console.log('parsed', ontology_parsed)

    return(ontology_parsed)
}

export default parseOntologyJson;