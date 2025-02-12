import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080/',
    specPattern: 'tests/e2e/**/*.cy.js',
    supportFile: false,
    fixturesFolder: 'tests/fixtures',
    screenshotsFolder: 'tests/screenshots',
  },
})
