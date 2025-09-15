import { compareCSAFExport } from './utils.js'

describe('Product Database Import', () => {
  before(() => {
    const api = Cypress.env('DATABASE_BASE_URL') || 'http://127.0.0.1:9999';

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    const requestJson = (method, path, body) =>
      cy
        .request({
          method,
          url: `${api}${path}`,
          headers,
          body,
          failOnStatusCode: true,
        })
        .its('body');

    const get = (path) => requestJson('GET', path);
    const post = (path, body) => requestJson('POST', path, body);

    let productId;
    let v1Id;
    let v2Id;

    return get('/api/v1/vendors').then((all) => {
      const allList = Array.isArray(all) ? all : all.items || [];
      const existing = allList.find((v) => v.name === 'Vendor Name');

      if (existing) {
        cy.log('Vendor already exists, skipping bootstrap');
        return;
      }

      return post('/api/v1/vendors', {
        description: 'Vendor Description',
        name: 'Vendor Name',
      }).then((vendor) => {
        return post('/api/v1/products', {
          description: 'Product Description',
          family_id: null,
          name: 'Product Name',
          type: 'software',
          vendor_id: vendor.id,
        });
      }).then((product) => {
        productId = product.id;

        return post('/api/v1/product-versions', {
          product_id: productId,
          version: '1.0.0',
        });

      }).then((version) => {
        v1Id = version.id;

        return post('/api/v1/product-versions', {
          product_id: productId,
          version: '2.0.0',
        });
      }).then(async (version) => {
        v2Id = version.id;

        return post('/api/v1/relationships', {
          category: 'default_component_of',
          source_node_ids: [v1Id],
          target_node_ids: [v2Id],
        });
      }).then(() => {
        return post('/api/v1/identification-helper', {
          category: 'purl',
          metadata: JSON.stringify({ purl: 'pkg:pypi/django@1.11.1' }),
          product_version_id: v2Id,
        });
      }).then(() => {
        cy.log('Seed complete');
      });
    });
  });

  it('Import products from product database and export CSAF', () => {
    // Mock the config file to enable product database import
    cy.intercept(
      { method: 'GET', url: '/.well-known/appspecific/io.github.sec-o-simple.json' },
      { fixture: 'database-import-config.json' }
    ).as('config');

    cy.visit('/');
    cy.contains('Create new Document').click();
    cy.contains('Software and Hardware').click();
    cy.contains('Create document').click();

    // Fill general
    cy.contains('Document Title').click().type('My first Software Advisory');
    cy.contains('Document ID').click().type('Test-002');
    cy.contains('Select TLP label').click();
    cy.contains('GREEN').click();

    // Fill notes
    cy.contains('Notes').click();
    cy.contains('Add Note').click();
    cy.contains('Note Title').click().type('Test Description');
    cy.contains('Note Content').click().type('This is a test description');

    // Fill publisher
    cy.contains('Publisher').click();
    cy.contains('Name of Publisher').click().type('Test Publisher');
    cy.contains('Namespace of Publisher').click().type('https://testpublisher.com');
    cy.contains('Contact Details').click().type('contact@testpublisher.com');

    // Fill references
    cy.contains('References').click();
    cy.contains('Add Reference').click();
    cy.contains('Summary').click().type('Test Reference');
    cy.contains('URL').click().type('https://testreference.com');

    // Fill acknowledgements
    cy.contains('Acknowledgements').click();
    cy.contains('Add Acknowledgement').click();
    cy.contains('Organization').click().type('Test Org');

    // Fill products
    cy.contains('Products').click();
    cy.contains('Add from Database').click();

    // click checkbox
    cy.contains('Vendor Name').parent().find('input[type="checkbox"]').check({ force: true });
    cy.contains('Add 1 product').click();

    // Fill vulnerabilities
    cy.contains('Vulnerabilities').click();
    cy.contains('Add Vulnerability').click();
    cy.contains('Title').click().type('Test Vulnerability');

    // button data-slot="tab" Notes click
    cy.get('[data-slot="tab"]').contains('Notes').click();
    cy.contains('Add Note').click();
    cy.contains('Note Title').click().type('Test Vulnerability Note');
    cy.contains('Note Content').click().type('This is a test vulnerability note');
    cy.wait(500);

    cy.get('[data-slot="tab"]').contains('Products').click();
    cy.contains('Add New Item').click();
    cy.wait(500);
    cy.contains('label[data-slot="label"]', 'Status')
      .parent()
      .find('[aria-haspopup="listbox"]').scrollIntoView().should('be.visible').click();
    cy.contains('li', 'Known Affected').click();
    cy.get('[aria-autocomplete="list"]').first().click();
    cy.contains('li', 'Vendor Name Product Name 1.0.0').click();

    cy.get('[data-slot="tab"]').contains('Remediations').click();
    cy.contains('Add Remediation').click();
    cy.contains('Details').click().type('This is a test remediation');
    cy.get('[placeholder="Add Product"]').first().click();
    cy.contains('li', 'Vendor Name Product Name 1.0.0').click();

    cy.get('[data-slot="tab"]').contains('Scores').click();
    cy.contains('Add Score').click();
    cy.contains('CVSS Vector String').click().type('CVSS:3.1/AV:N/AC:L/PR:H/UI:N/S:U/C:L/I:L/A:N');
    cy.get('[placeholder="Add Product"]').first().click();
    cy.wait(100);
    cy.contains('li', 'Vendor Name Product Name 1.0.0').click();

    // Set history
    cy.contains('History').click();
    cy.contains('Document Status').parent().parent().find('button').click();
    cy.contains('li', 'Final').click();
    cy.wait(500);

    // Compare the downloaded CSAF export with expected results
    const downloadPath = 'cypress/downloads/Test-002.json';
    cy.task('deleteFileIfExists', downloadPath);
    cy.contains('CSAF Export').click();
    compareCSAFExport(
      downloadPath,
      'tests/fixtures/expected-csaf-export-database-import.json'
    );
  });
});