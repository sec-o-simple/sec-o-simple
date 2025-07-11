type JSONValue = string | number | boolean | null | JSONObject | JSONArray
interface JSONObject {
  [key: string]: JSONValue
}
interface JSONArray extends Array<JSONValue> {}

export default {
  document: {
    id: 'string',
    lang: 'string',
    title: 'string',
    // Gets automatically generated
    // and is not part of the original CSAF document.
    category: 'string',
    csaf_version: 'string',
    // Tracking is added, because it is always generated automatically
    // and not part of the original CSAF document.
    tracking: {
      status: 'string',
      revision_history: [
        {
          date: 'string',
          number: 'string',
          summary: 'string',
        },
      ],
    },
    references: [
      {
        summary: 'string',
        url: 'string',
        category: 'string',
      },
    ],
    publisher: {
      name: 'string',
      category: 'string',
      namespace: 'string',
      contact_details: 'string',
      issuing_authority: 'string',
    },
    notes: [
      {
        category: 'string',
        title: 'string',
        text: 'string',
      },
    ],
    acknowledgments: [
      {
        organization: 'string',
        summary: 'string',
        names: ['string'],
      },
    ],
  },

  product_tree: {
    branches: [
      {
        category: 'string',
        name: 'string',
        product: {
          name: 'string',
          product_id: 'string',
        },
      },
    ],
    relationships: [
      {
        category: 'string',
        product_reference: 'string',
        relates_to_product_reference: 'string',
      },
    ],
  },
  vulnerabilities: [
    {
      id: 'string',
      cve: 'string',
      cwe: 'string',
      title: 'string',
      notes: [
        {
          category: 'string',
          text: 'string',
          title: 'string',
        },
      ],
      // Not all statuses are used in the UI, but they are defined here for completeness
      product_status: {
        known_affected: [['string']],
        fixed: [['string']],
        // first_fixed: [['string']],
        // first_affected: [['string']],
        known_not_affected: [['string']],
        // last_affected: [['string']],
        // recommended: [['string']],
        under_investigation: [['string']],
      },
      remediations: [
        {
          category: 'string',
          date: 'string',
          details: 'string',
          url: 'string',
          product_ids: ['string'],
        },
      ],
      scores: [
        {
          cvss_v3: {
            version: 'string',
            vectorString: 'string',
            baseSeverity: 'string',
            temporalSeverity: 'string',
            environmentalSeverity: 'string',
          },
          products: ['string'],
        },
      ],
    },
  ],
} as JSONObject
