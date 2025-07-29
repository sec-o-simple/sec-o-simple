# Sec-O-Simple

[![Tests](https://github.com/sec-o-simple/sec-o-simple/actions/workflows/tests.yml/badge.svg)](https://github.com/sec-o-simple/sec-o-simple/actions/workflows/tests.yml)
[![Lint](https://github.com/sec-o-simple/sec-o-simple/actions/workflows/lint.yml/badge.svg)](https://github.com/sec-o-simple/sec-o-simple/actions/workflows/lint.yml)
[![Build](https://github.com/sec-o-simple/sec-o-simple/actions/workflows/build.yml/badge.svg)](https://github.com/sec-o-simple/sec-o-simple/actions/workflows/build.yml)

Further information can be found in the [Documentation](./docs)

## Development

### Branch policy

When working on new features or fixing bugs, create a new branch based on main
and give it a meaningful name. Rebase or merge main regularly into your branch
in order to prevent large merge conflicts.

Naming examples:

- feat/navigation-redesign
- fix/excessive-loading-time

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or higher
- [NPM](https://www.npmjs.com/package/npm)

### Project setup

```sh
# Clone repository
git clone git@github.com:sec-o-simple/sec-o-simple.git
cd sec-o-simple

# Install NPM dependencies
npm install
```

### Run server

```sh
# Start vite development server
npm run dev
```

The webapp is now accessible at [http://localhost:8080](http://localhost:8080)

### Testing

```sh
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage report
npm run test:coverage

# Run tests with UI (optional)
npm run test:ui
```

The project maintains a minimum code coverage threshold of 70% for:
- Branches
- Functions  
- Lines
- Statements

Coverage reports are automatically generated during CI/CD and available as artifacts in the GitHub Actions workflow. You can also view coverage reports locally by running `npm run test:coverage` and opening the generated HTML report in `coverage/index.html`.
