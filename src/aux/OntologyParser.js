import * as d3 from 'd3';
/* parseOntologyJson
 * Una función que toma por entrada un json con la ontología y devuelve un objeto con el siguiente
 * formato :
 ontology_parsed
 \_ attributes
  _ entities
  _ fields
  _ non_classified
  _ ontology_base
  _ ontology_prefix
  _ prefixes
  _ relationships
 * */
function parseOntologyJson(json){
    const shorttenUriWithPrefix = (uri,base,prefix)=>(!uri.includes(base)?uri:`${prefix}:${uri.split('#')[1]}`);
    const ontology_parsed = {};
    if(d3.keys(json).length == 1)
        json = json[d3.keys(json)[0]];

    // Prefixes for external referenced ontologies
    ontology_parsed.prefixes = d3.entries(json)
        .filter(d=>d.key.includes('xmlns'))
        .map(d=>({prefix:d.key.includes(':')?d.key.split(':')[1]:d.key, uri:d.value}));
    ontology_parsed.fields = d3.keys(json).filter(d=>!d.includes('xmlns'))
            
    // Base uri and prefix for the current ontology
    ontology_parsed.ontology_base = json['xml:base']?json['xml:base']:"not_defined";
    const base_fields = ontology_parsed.ontology_base.split('/');
    ontology_parsed.ontology_prefix = base_fields.length > 0?base_fields[base_fields.length-1]:"not_defined";

    // Entity and inheritance extraction
    const classes = [];
    const equivalentClasses = {};

    const shortten = d=> shorttenUriWithPrefix(d, ontology_parsed.ontology_base, ontology_parsed.ontology_prefix);

    if(ontology_parsed.fields.includes('rdfs:Class'))
        classes.push(...json['rdfs:Class'].length==undefined?[json['rdfs:Class']]:json['rdfs:Class'])
    if(ontology_parsed.fields.includes('owl:Class'))
        classes.push(...json['owl:Class'].length==undefined?[json['owl:Class']]:json['owl:Class'])
    classes
        .filter(c=>c.hasOwnProperty('owl:equivalentClass'))
        .forEach(c=>c['owl:equivalentClass']
            .filter(e=>e.hasOwnProperty('rdf:resource'))
            .forEach(e=>{                
                equivalentClasses[shortten(e['rdf:resource'])] = shortten(c['rdf:about']);
                equivalentClasses[shortten(c['rdf:about'])] = shortten(e['rdf:resource']);
            })
    )

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
        entity.count = 1;

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
                    relationship.value = 5;
                    ontology_parsed.relationships.push(relationship)

                    // Equivalent classes should have their respective counterparts
                    let eq = {};
                    if(equivalentClasses.hasOwnProperty(relationship.source)){
                        Object.assign(eq, relationship);
                        eq.source = equivalentClasses[eq.source];
                        ontology_parsed.relationships.push(relationship);

                        if(equivalentClasses.hasOwnProperty(relationship.target)){
                            eq.target = equivalentClasses[eq.target];
                            ontology_parsed.relationships.push(relationship);
                        }
                    }
                    if(equivalentClasses.hasOwnProperty(relationship.target)){
                        Object.assign(eq, relationship);
                        eq.target = equivalentClasses[eq.target];
                        ontology_parsed.relationships.push(relationship);

                        if(equivalentClasses.hasOwnProperty(relationship.source)){
                            eq.source = equivalentClasses[eq.source];
                            ontology_parsed.relationships.push(relationship);
                        }
                    }
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
                        if(d['rdf:resource']){
                            entry.source = shorttenUriWithPrefix(
                                    d['rdf:resource'], 
                                    ontology_parsed.ontology_base, 
                                    ontology_parsed.ontology_prefix);
                            
                            ontology_parsed.attributes.push(entry)
                        }
                    });
                }else
                    ontology_parsed['non_classified_attributes'].push(entry)
            }
        });
    }

    // En owl 
    if(ontology_parsed.fields.includes('owl:ObjectProperty')){
        json['owl:ObjectProperty'].map(attr=>{
                if(attr['rdf:about'] && attr['rdfs:domain'] && attr['rdfs:range']){
                    const relationship= shorttenUriWithPrefix(
                            attr['rdf:about'], 
                            ontology_parsed.ontology_base, 
                            ontology_parsed.ontology_prefix),
                    value= 6.5;

                    let domain = attr['rdfs:domain'].length == undefined?[attr['rdfs:domain']]:attr['rdfs:domain'];
                    let range  = attr['rdfs:range'].length == undefined?[attr['rdfs:range']]:attr['rdfs:range'];

                    if(attr['rdfs:range']['owl:Class'] && attr['rdfs:range']['owl:Class']['owl:unionOf']){
                       range = attr['rdfs:range']['owl:Class']['owl:unionOf']['rdf:Description'].map(x=>({'rdf:resource':x['rdf:about']}))
                    }

                    if(attr['rdfs:domain']['owl:Class'] && attr['rdfs:domain']['owl:Class']['owl:unionOf']){
                       domain = attr['rdfs:domain']['owl:Class']['owl:unionOf']['rdf:Description'].map(x=>({'rdf:resource':x['rdf:about']}))
                    }

                    let combinations = [];
                    domain.map(dm=>range.map(rn=>{
                        combinations.push({domain:dm, range:rn})
                    }));
                    
                    combinations.map(combination=>{
                        if(combination.domain['rdf:resource'] && combination.range['rdf:resource']){
                            let entry = {
                                    relationship : relationship,
                                    value : value,
                                    source : shorttenUriWithPrefix(
                                        combination.domain['rdf:resource'], 
                                        ontology_parsed.ontology_base, 
                                        ontology_parsed.ontology_prefix),
                                    target : shorttenUriWithPrefix(
                                        combination.range['rdf:resource'], 
                                        ontology_parsed.ontology_base, 
                                        ontology_parsed.ontology_prefix)
                            };

                            ontology_parsed.relationships.push(entry);

                            // Equivalent classes should have their respective counterparts
                            let eq = {};
                            if(equivalentClasses.hasOwnProperty(entry.source)){
                                Object.assign(eq, entry);
                                eq.source = equivalentClasses[eq.source];
                                ontology_parsed.relationships.push(eq);

                                if(equivalentClasses.hasOwnProperty(entry.target)){
                                    eq.target = equivalentClasses[eq.target];
                                    ontology_parsed.relationships.push(eq);
                                }
                            }
                            if(equivalentClasses.hasOwnProperty(entry.target)){
                                Object.assign(eq, entry);
                                eq.target = equivalentClasses[eq.target];
                                ontology_parsed.relationships.push(eq);

                                if(equivalentClasses.hasOwnProperty(entry.source)){
                                    eq.source = equivalentClasses[eq.source];
                                    ontology_parsed.relationships.push(eq);
                                }
                            }
                        }
                    });
                }
        });
    }

    
    // En rdf Property define todas las propiedades que las entidades tienen. Bien attributos o 
    // relaciones entre entidades definidas en la ontología. Para todas las entradas existen los
    // campos rdf:about con el nombre. Si incluye un campo rdfs:domain entonces podemos asignarle 
    // el atributo a una entidad en concreto; si tiene el atributo rdfs:range y el rdf:resource no
    // es una entidad entonces es un atributo y si no, una relación
    if(ontology_parsed.fields.includes('rdf:Property')){
        const entity_names = ontology_parsed.entities.map(d=>d.name);

        json['rdf:Property'].map(attr=>{
            if(attr['rdf:about'] && attr['rdfs:domain']){
                const domain = attr['rdfs:domain'].length == undefined?[attr['rdfs:domain']]:attr['rdfs:domain'];
                
                domain.map(d=>{
                    if(d['rdf:resource']){
                        const entry = {source : shorttenUriWithPrefix(
                                d['rdf:resource'], 
                                ontology_parsed.ontology_base, 
                                ontology_parsed.ontology_prefix)};

                        const name = shorttenUriWithPrefix(
                                attr['rdf:about'], 
                                ontology_parsed.ontology_base, 
                                ontology_parsed.ontology_prefix);
                        
                        if(attr['rdfs:range']){
                            const range = attr['rdfs:range'].length == undefined?[attr['rdfs:range']]:attr['rdfs:range'];
                            
                            range.map(r=>{
                                const r_name = shorttenUriWithPrefix(
                                d['rdf:resource'], 
                                ontology_parsed.ontology_base, 
                                ontology_parsed.ontology_prefix);

                                if(entity_names.includes(r_name)){
                                    entry.relationship = name;
                                    entry.target = r_name;
                                    entry.value = 6.5;
                                    ontology_parsed.relationships.push(entry)

                                    // Equivalent classes should have their respective counterparts
                                    let eq = {};
                                    if(equivalentClasses.hasOwnProperty(entry.source)){
                                        Object.assign(eq, entry);
                                        eq.source = equivalentClasses[eq.source];
                                        ontology_parsed.relationships.push(eq);

                                        if(equivalentClasses.hasOwnProperty(entry.target)){
                                            eq.target = equivalentClasses[eq.target];
                                            ontology_parsed.relationships.push(eq);
                                        }
                                    }
                                    if(equivalentClasses.hasOwnProperty(entry.target)){
                                        Object.assign(eq, entry);
                                        eq.target = equivalentClasses[eq.target];
                                        ontology_parsed.relationships.push(eq);

                                        if(equivalentClasses.hasOwnProperty(entry.source)){
                                            eq.source = equivalentClasses[eq.source];
                                            ontology_parsed.relationships.push(eq);
                                        }
                                    }
                                }else{
                                    entry.attr = name;
                                    ontology_parsed.attributes.push(entry)
                                }
                                
                            })
                        }else{
                            entry.attr = name;
                            ontology_parsed.attributes.push(entry)
                        }
                    }
                });
            }
        });
    }

    return(ontology_parsed)
}

export default parseOntologyJson;
