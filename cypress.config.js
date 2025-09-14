import { defineConfig } from 'cypress'
import fs from 'fs'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080/',
    specPattern: 'tests/e2e/**/*.cy.js',
    supportFile: false,
    fixturesFolder: 'tests/fixtures',
    defaultCommandTimeout: 8000,
    viewportWidth: 1280,
    viewportHeight: 800,
    screenshotsFolder: 'tests/screenshots',
    setupNodeEvents(on, config) {
      on('task', {
        fileExists(filename) {
          return fs.existsSync(filename)
        },
        deleteFileIfExists(filename) {
          if (fs.existsSync(filename)) {
            fs.unlinkSync(filename)
          }
          return true
        },
      })
      return config
    },
  },
})
