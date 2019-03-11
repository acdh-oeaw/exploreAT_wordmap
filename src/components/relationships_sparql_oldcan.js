const relationships = [
  {
    "source": "oldcan:Source",
    "relationship": "oldcan:hasMultimedia",
    "target": "oldcan:EditedText",
    "value": 6.5
  },
  {
    "source": "oldcan:Source",
    "relationship": "oldcan:hasMultimedia",
    "target": "oldcan:Multimedia",
    "value": 6.5
  },
  {
    "source": "oldcan:Source",
    "relationship": "oldcan:hasMultimedia",
    "target": "oldcan:PrintinUnit",
    "value": 6.5
  },
  {
    "source": "oldcan:Source",
    "relationship": "oldcan:hasMultimedia",
    "target": "oldcan:Photograph",
    "value": 6.5
  },
  {
    "source": "oldcan:Source",
    "relationship": "oldcan:hasMultimedia",
    "target": "oldcan:Newspaper",
    "value": 6.5
  },
  {
    "source": "oldcan:Source",
    "relationship": "oldcan:hasMultimedia",
    "target": "oldcan:Realia",
    "value": 6.5
  },
  {
    "source": "oldcan:PaperSlip",
    "relationship": "oldcan:hasSource",
    "target": "oldcan:Source",
    "value": 6.5
  },
  {
    "source": "oldcan:PaperSlip",
    "relationship": "oldcan:hasMultimedia",
    "target": "oldcan:Multimedia",
    "value": 6.5
  },
  {
    "source": "oldcan:PaperSlip",
    "relationship": "oldcan:hasMultimedia",
    "target": "oldcan:%20Drawing",
    "value": 6.5
  },
  {
    "source": "oldcan:PaperSlip",
    "relationship": "oldcan:hasMultimedia",
    "target": "oldcan:EditedText",
    "value": 6.5
  },
  {
    "source": "oldcan:PaperSlip",
    "relationship": "oldcan:hasMultimedia",
    "target": "oldcan:Audio",
    "value": 6.5
  },
  {
    "source": "oldcan:PaperSlip",
    "relationship": "oldcan:hasMultimedia",
    "target": "oldcan:PrintinUnit",
    "value": 6.5
  },
  {
    "source": "oldcan:author",
    "relationship": "oldcan:hasMultimedia",
    "target": "oldcan:Multimedia",
    "value": 6.5
  },
  {
    "source": "oldcan:author",
    "relationship": "oldcan:hasMultimedia",
    "target": "oldcan:PrintinUnit",
    "value": 6.5
  },
  {
    "source": "oldcan:author",
    "relationship": "oldcan:hasMultimedia",
    "target": "oldcan:Photograph",
    "value": 6.5
  },
  {
    "source": "oldcan:author",
    "relationship": "oldcan:hasMultimedia",
    "target": "oldcan:EditedText",
    "value": 6.5
  },
  {
    "source": "oldcan:author",
    "relationship": "oldcan:hasMultimedia",
    "target": "oldcan:Newspaper",
    "value": 6.5
  },
  {
    "source": "oldcan:author",
    "relationship": "oldcan:hasMultimedia",
    "target": "oldcan:Audio",
    "value": 6.5
  },
  {
    "source": "oldcan:Lemma",
    "relationship": "oldcan:composedOf",
    "target": "oldcan:Lemma",
    "value": 6.5
  },
  {
    "source": "oldcan:Lemma",
    "relationship": "oldcan:hasMultimedia",
    "target": "oldcan:Multimedia",
    "value": 6.5
  },
  {
    "source": "oldcan:Lemma",
    "relationship": "oldcan:derivedFrom",
    "target": "oldcan:Lemma",
    "value": 6.5
  },
  {
    "source": "oldcan:Lemma",
    "relationship": "oldcan:hasMultimedia",
    "target": "oldcan:%20Drawing",
    "value": 6.5
  },
  {
    "source": "oldcan:Lemma",
    "relationship": "oldcan:hasMultimedia",
    "target": "oldcan:EditedText",
    "value": 6.5
  },
  {
    "source": "oldcan:PaperSlipRecord",
    "relationship": "oldcan:hasPaperSlipRecordDefinition",
    "target": "oldcan:PaperSlipRecordDefinition",
    "value": 6.5
  },
  {
    "source": "oldcan:PaperSlipRecord",
    "relationship": "oldcan:hasPaperSlip",
    "target": "oldcan:PaperSlip",
    "value": 6.5
  },
  {
    "source": "oldcan:PaperSlipRecord",
    "relationship": "oldcan:hasLemma",
    "target": "oldcan:Lemma",
    "value": 6.5
  },
  {
    "source": "oldcan:PaperSlipRecord",
    "relationship": "oldcan:containsQuestion",
    "target": "oldcan:Question",
    "value": 6.5
  },
  {
    "source": "oldcan:PaperSlipRecord",
    "relationship": "oldcan:hasPaperSlipRecordNote",
    "target": "oldcan:PaperSlipRecordNote",
    "value": 6.5
  },
  {
    "source": "oldcan:PaperSlipRecord",
    "relationship": "oldcan:hasReferenceLemma",
    "target": "oldcan:Lemma",
    "value": 6.5
  },
  {
    "source": "oldcan:Questionnaire",
    "relationship": "oldcan:hasAuthor",
    "target": "oldcan:author",
    "value": 6.5
  },
  {
    "source": "oldcan:SystematicQuestionnaire",
    "relationship": "oldcan:hasAuthor",
    "target": "oldcan:author",
    "value": 6.5
  },
  {
    "source": "oldcan:AdditionalQuestionnaire",
    "relationship": "oldcan:hasAuthor",
    "target": "oldcan:author",
    "value": 6.5
  },
  {
    "source": "oldcan:DialectographicQuestionnaire",
    "relationship": "oldcan:hasAuthor",
    "target": "oldcan:author",
    "value": 6.5
  },
  {
    "source": "oldcan:Question",
    "relationship": "oldcan:isQuestionOf",
    "target": "oldcan:Questionnaire",
    "value": 6.5
  },
  {
    "source": "oldcan:Question",
    "relationship": "oldcan:isQuestionOf",
    "target": "oldcan:SystematicQuestionnaire",
    "value": 6.5
  },
  {
    "source": "oldcan:Question",
    "relationship": "oldcan:isQuestionOf",
    "target": "oldcan:AdditionalQuestionnaire",
    "value": 6.5
  },
  {
    "source": "oldcan:Question",
    "relationship": "oldcan:isQuestionOf",
    "target": "oldcan:DialectographicQuestionnaire",
    "value": 6.5
  }
]
export default relationships;