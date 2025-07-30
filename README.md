# Sec-O-Simple

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
# Run automated tests
npm test
```

### Run with Docker

If you'd like to run the production build using Docker:

```bash
docker-compose up --build

```
