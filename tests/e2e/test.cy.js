describe('temporary test', () => {
  it('test', () => {
    cy.visit('/')
    cy.contains('failing test')
  })
})
