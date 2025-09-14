import { compareCSAFExport } from './utils.js'

Cypress.on('window:before:load', window => {
  window.document.head.insertAdjacentHTML(
    'beforeend',
    `
    <style>
      /* Disable CSS transitions. */
      *, *::before, *::after { -webkit-transition: none !important; -moz-transition: none !important; -o-transition: none !important; transition: none !important; }
      /* Disable CSS animations. */
      *, *::before, *::after { -webkit-animation: none !important; -moz-animation: none !important; -o-animation: none !important; animation: none !important; }
    </style>
  `
  )
})

describe('Create a new software advisory & export it', () => {
  it('Create a new software advisory & export it', () => {
    cy.visit('/');
    cy.contains('Create new Document').click();
    cy.contains('Software and Hardware').click();
    cy.contains('Create document').click();

    // // Fill general
    cy.contains('Document Title').click().type('My first Software Advisory');
    cy.contains('Document ID').click().type('Test-001');
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
    cy.contains('Add Vendor').click();
    cy.contains('Name').click().type('Test Vendor');
    cy.wait(500);
    cy.contains('Save').click();
    // Create test software
    cy.contains('Test Vendor').closest('[data-slot="trigger"]').click().click();
    cy.contains('Add Product').click();
    cy.contains('Name').click().type('Test Software');
    cy.contains('Description').click().type('This is a test product');
    cy.wait(500);
    cy.contains('Save').click();
    cy.contains('Test Software').parent().parent().parent().parent().find('button').first().click();
    cy.contains('Add Version').click();
    cy.contains('Name').click().type('1.0.0');
    cy.wait(500);
    cy.contains('Save').click();

    // Create test hardware
    cy.contains('Products').click();
    cy.contains('Test Vendor').closest('[data-slot="trigger"]').click().click();
    cy.contains('Add Product').click();
    cy.contains('Name').click().type('Test Hardware');
    cy.contains('Description').click().type('This is a test hardware product');
    cy.contains('Product Type').parent().parent().find('button').click();
    cy.wait(100);
    cy.contains('li', 'Hardware').click();
    cy.wait(500);
    cy.contains('Save').click();
    cy.contains('Test Hardware').parent().parent().parent().parent().find('button').first().click();
    cy.contains('Add Version').click();
    cy.contains('Name').click().type('1.2.0');
    cy.wait(500);
    cy.contains('Save').click();

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
    cy.contains('li', 'Test Vendor Test Software 1.0.0 installed on Test Vendor Test Hardware 1.2.0').click();

    cy.get('[data-slot="tab"]').contains('Remediations').click();
    cy.contains('Add Remediation').click();
    cy.contains('Details').click().type('This is a test remediation');
    cy.get('[placeholder="Add Product"]').first().click();
    cy.contains('li', 'Test Vendor Test Software 1.0.0 installed on Test Vendor Test Hardware 1.2.0').click();

    cy.get('[data-slot="tab"]').contains('Scores').click();
    cy.contains('Add Score').click();
    cy.contains('CVSS Vector String').click().type('CVSS:3.1/AV:N/AC:L/PR:H/UI:N/S:U/C:L/I:L/A:N');
    cy.get('[placeholder="Add Product"]').first().click();
    cy.wait(100);
    cy.contains('li', 'Test Vendor Test Software 1.0.0 installed on Test Vendor Test Hardware 1.2.0').click();

    // Set history
    cy.contains('History').click();
    cy.contains('Document Status').parent().parent().find('button').click();
    cy.contains('li', 'Final').click();
    cy.wait(500);

    // Compare the downloaded CSAF export with expected results
    const downloadPath = 'cypress/downloads/Test-001.json';
    cy.task('deleteFileIfExists', downloadPath);
    cy.contains('CSAF Export').click();
    compareCSAFExport(
      'cypress/downloads/Test-001.json',
      'tests/fixtures/expected-csaf-export.json'
    );
  });
})
