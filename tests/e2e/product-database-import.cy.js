import { compareCSAFExport } from './utils.js'

describe('Product Database Import', () => {
  it('Import products from product database and export CSAF', () => {
    // Mock the config file to enable product database import
    cy.intercept(
      {
        method: 'GET',
        url: '/.well-known/appspecific/io.github.sec-o-simple.json',
      },
      { fixture: 'database-import-config.json' },
    ).as('config')

    // Mock database API calls
    cy.intercept('GET', '**/api/v1/vendors', [
      {
        id: 'vendor_id_1',
        description: 'Vendor Description',
        name: 'Vendor Name',
        product_count: 1,
      },
    ]).as('getVendors')

    cy.intercept('GET', '**/api/v1/products', [
      {
        id: 'product_id_1',
        vendor_id: 'vendor_id_1',
        description: 'Product Description',
        name: 'Product Name',
        type: 'software',
        full_name: 'Vendor Name Product Name',
      },
    ]).as('getProducts')

    cy.intercept('POST', '**/api/v1/products/export', {
      product_tree: {
        branches: [
          {
            category: 'vendor',
            name: 'Vendor Name',
            branches: [
              {
                category: 'product_name',
                name: 'Product Name',
                branches: [
                  {
                    category: 'product_version',
                    name: '1.0.0',
                    product: {
                      name: 'Vendor Name Product Name 1.0.0',
                      product_id: 'product_1',
                    },
                  },
                  {
                    category: 'product_version',
                    name: '2.0.0',
                    product: {
                      name: 'Vendor Name Product Name 2.0.0',
                      product_id: 'product_2',
                      product_identification_helper: {
                        purl: 'pkg:pypi/django@1.11.1',
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
        relationships: [
          {
            category: 'default_component_of',
            product_reference: 'product_1',
            relates_to_product_reference: 'product_2',
            full_product_name: {
              name: 'Vendor Name Product Name 1.0.0 default component of Vendor Name Product Name 2.0.0',
              product_id: 'product_3',
            },
          },
        ],
        full_product_names: [],
      },
    }).as('exportProducts')

    cy.visit('/')
    cy.contains('Create new Document').click()
    cy.contains('Software and Hardware').click()
    cy.contains('Create document').click()

    // Fill general
    cy.contains('Document Title')
      .parent()
      .find('input')
      .click()
      .type('My first Software Advisory')
    cy.contains('Document ID').parent().find('input').click().type('Test-002')
    cy.contains('Select TLP label').click()
    cy.contains('GREEN').click()

    // Fill notes
    cy.contains('Notes').click()
    cy.contains('Add Note').click()
    cy.contains('Note Title')
      .parent()
      .find('input')
      .click()
      .type('Test Description')
    cy.contains('Note Content')
      .parent()
      .find('textarea')
      .click()
      .type('This is a test description')

    // Fill publisher
    cy.contains('Publisher').click()
    cy.contains('Name of Publisher')
      .parent()
      .find('input')
      .click()
      .type('Test Publisher')
    cy.contains('Namespace of Publisher')
      .parent()
      .find('input')
      .click()
      .type('https://testpublisher.com')

    // Fill references
    cy.contains('References').click()
    cy.contains('Add Reference').click()
    cy.contains('Summary').parent().find('input').click().type('Test Reference')
    cy.contains('URL')
      .parent()
      .find('input')
      .click()
      .type('https://testreference.com')

    // Fill acknowledgements
    cy.contains('Acknowledgements').click()
    cy.contains('Add Acknowledgement').click()
    cy.contains('Organization').parent().find('input').click().type('Test Org')

    // Fill products
    cy.contains('Products').click()
    cy.contains('Add from Database').click()

    // click checkbox
    cy.contains('Vendor Name')
      .parent()
      .find('input[type="checkbox"]')
      .check({ force: true })
    cy.contains('Add 1 product').click()

    // Fill vulnerabilities
    cy.contains('Vulnerabilities').click()
    cy.contains('Add Vulnerability').click()
    cy.contains('Title')
      .parent()
      .find('input')
      .click()
      .type('Test Vulnerability')

    // button data-slot="tab" Notes click
    cy.get('[data-slot="tab"]').contains('Notes').click()
    cy.contains('Add Note').click()
    cy.contains('Note Title')
      .parent()
      .find('input')
      .click()
      .type('Test Vulnerability Note')
    cy.contains('Note Content')
      .parent()
      .find('textarea')
      .click()
      .type('This is a test vulnerability note')
    cy.wait(500)

    cy.get('[data-slot="tab"]').contains('Products').click()
    cy.contains('Add New Item').click()
    cy.wait(500)
    cy.contains('label[data-slot="label"]', 'Status')
      .parent()
      .find('[aria-haspopup="listbox"]')
      .scrollIntoView()
      .should('be.visible')
      .click()
    cy.contains('li', 'Known Affected').click()
    cy.get('[aria-autocomplete="list"]').first().click()
    cy.contains('li', 'Vendor Name Product Name 1.0.0').click()

    cy.get('[data-slot="tab"]').contains('Remediations').click()
    cy.contains('Add Remediation').click()
    cy.contains('Details')
      .parent()
      .find('textarea')
      .click()
      .type('This is a test remediation')
    cy.get('[placeholder="Add Product"]').first().click()
    cy.contains('li', 'Vendor Name Product Name 1.0.0').click()

    cy.get('[data-slot="tab"]').contains('Scores').click()
    cy.contains('Add Score').click()
    cy.contains('CVSS Vector String')
      .parent()
      .find('input')
      .click()
      .type('CVSS:3.1/AV:N/AC:L/PR:H/UI:N/S:U/C:L/I:L/A:N')
    cy.get('[placeholder="Add Product"]').first().click()
    cy.wait(100)
    cy.contains('li', 'Vendor Name Product Name 1.0.0').click()

    // Set history
    cy.contains('History').click()
    cy.contains('Document Status').parent().parent().find('button').click()
    cy.contains('li', 'Final').click()
    cy.wait(500)

    // Compare the downloaded CSAF export with expected results
    const downloadPath = 'cypress/downloads/Test-002.json'
    cy.task('deleteFileIfExists', downloadPath)
    cy.contains('CSAF Export').click()
    compareCSAFExport(
      downloadPath,
      'tests/fixtures/expected-csaf-export-database-import.json',
    )
  })
})
