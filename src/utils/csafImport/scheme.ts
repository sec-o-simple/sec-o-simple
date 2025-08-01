type JSONValue = string | number | boolean | null | JSONObject | JSONArray
interface JSONObject {
  [key: string]: JSONValue
}
interface JSONArray extends Array<JSONValue> {}

const IdentificationHelper = {
  hashes: [
    {
      file_hashes: [{ algorithm: 'string', value: 'string' }],
      filename: 'string',
    },
  ],
  sbom_urls: ['string'],
  purl: 'string',
  model_numbers: ['string'],
  serial_numbers: ['string'],
  cpe: 'string',
  filename: 'string',
  x_generic_uris: [
    {
      namespace: 'string',
      uri: 'string',
    },
  ],
  skus: ['string'],
}

export default {
  document: {
    lang: 'string',
    title: 'string',
    // Gets automatically generated
    // and is not part of the original CSAF document.
    category: 'string',
    csaf_version: 'string',
    // Tracking is added, because it is always generated automatically
    // and not part of the original CSAF document.
    distribution: {
      tlp: {
        label: 'string',
        url: 'string',
      },
    },
    tracking: {
      id: 'string',
      status: 'string',
      version: 'string',
      current_release_date: 'string',
      initial_release_date: 'string',
      generator: {
        date: 'string',
        engine: {
          version: 'string',
          name: 'string',
        },
      },
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
        urls: ['string'],
      },
    ],
  },

  product_tree: {
    branches: [
      // Vendors
      {
        category: 'string',
        name: 'string',

        product: {
          product_identification_helper: IdentificationHelper,
        },
        branches: [
          // Product Names
          {
            category: 'string',
            name: 'string',
            product: {
              name: 'string',
              product_id: 'string',
              product_identification_helper: IdentificationHelper,
            },
            branches: [
              // Product Versions
              {
                category: 'string',
                name: 'string',
                product: {
                  name: 'string',
                  product_id: 'string',
                  product_identification_helper: IdentificationHelper,
                },
              },
            ],
          },
        ],
      },
    ],
    relationships: [
      {
        category: 'string',
        product_reference: 'string',
        relates_to_product_reference: 'string',
        full_product_name: {
          name: 'string',
          product_id: 'string',
        },
      },
    ],
  },
  vulnerabilities: [
    {
      id: 'string',
      cve: 'string',
      cwe: {
        id: 'string',
        name: 'string',
      },
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
            baseScore: 'string',
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
