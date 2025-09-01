# Sec-O-Simple

<!-- TOC depthfrom:2 depthto:3 -->
- [Sec-O-Simple](#sec-o-simple)
  - [Introduction](#introduction)
  - [Getting started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Clone \& Setup](#clone--setup)
    - [Configuration](#configuration)
    - [Running Locally](#running-locally)
    - [Building for Production](#building-for-production)
  - [Run with Docker](#run-with-docker)
    - [Basic Usage](#basic-usage)
    - [Custom Configuration with .well-known File](#custom-configuration-with-well-known-file)
    - [Including Product Database](#including-product-database)
  - [Architecture Overview](#architecture-overview)
    - [Code \& Module Organization](#code--module-organization)
    - [Tech Stack](#tech-stack)
  - [Contributing](#contributing)
  - [Release](#release)
  - [Dependencies](#dependencies)
  - [License](#license)
  - [Security Considerations](#security-considerations)
<!-- /TOC -->

## Introduction

_Placeholder for BSI Description_

## Getting started

### Prerequisites

- [Git](https://github.com)
- [Node.js](https://nodejs.org/) 20 or higher
- [NPM](https://www.npmjs.com/package/npm)

### Clone & Setup

```sh
git clone git@github.com:sec-o-simple/sec-o-simple.git
cd sec-o-simple
npm install
```

### Configuration

Further information about the configuration can be found in the [Configuration](./docs/CONFIG.md)

### Running Locally

```sh
npm run dev
```

By default, the webapp is accessible at: [http://localhost:8080](http://localhost:8080)

Optional helpful commands:

```sh
npm run lint      # run linting (if configured)
npm run lint:fix  # fix linting issues
npm test          # run automated tests
```

### Building for Production

```sh
npm run build
npm run preview
```

Built artifacts are output to the production directory (e.g., `dist`). Preview locally with the provided script.

## Run with Docker

### Basic Usage

```bash
docker run -p 8080:80 ghcr.io/sec-o-simple/sec-o-simple:latest
```

The application will be available at [http://localhost:8080](http://localhost:8080).

### Custom Configuration with .well-known File

To provide your own application-specific configuration, mount a custom `.well-known/appspecific/io.github.sec-o-simple.json` file:

```bash
# See docs/io.github.sec-o-simple.example.json for an example configuration
docker run -p 8080:80 \
  -v /path/to/your/io.github.sec-o-simple.json:/usr/share/nginx/html/.well-known/appspecific/io.github.sec-o-simple.json:ro \
  ghcr.io/sec-o-simple/sec-o-simple:latest
```

See [./docs/CONFIG.md](./docs/CONFIG.md) for more details on the configuration options available.

### Including Product Database

We provide a pre-configured Docker Compose setup that includes both the Sec-O-Simple application and an integrated product database. For production usage, you might need to add a reverse proxy and update the configuration accordingly.

```bash
git clone git@github.com:sec-o-simple/sec-o-simple.git
cd sec-o-simple
docker compose -f docker/with-db/docker-compose.yml up
```

## Architecture Overview

A frontend-only application built with **React.js**, styled with **Tailwind CSS**, and composed via **HeroUI**. Local state is managed with **Zustand** where appropriate, and all input is validated through the **csaf-validator-lib**.

### Code & Module Organization

- `src/` — application source code (components, services, utilities).  
- `tests/` — automated test suites (unit/integration).  
- `docs/` — supplemental documentation (schema, config, well-known).  
- `package.json` / `package-lock.json` — scripts and dependency management.

### Tech Stack

- **UI / Presentation:**  
  - React.js  
  - Tailwind CSS  
  - HeroUI (design system / component library)  

- **State Management:**  
  - Zustand — lightweight, composable global/local state store

- **Validation:**  
  - `csaf-validator-lib` — used for validating input 

## Contributing

Please refer to this [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Release

Please refer to this [`RELEASE.md`](RELEASE.md)

## Dependencies

Regarding dependencies please refer to [`DEPENDENCIES.md`](DEPENDENCIES.md).

## License

This project is licensed under the [Apache License](./LICENSE).  

## Security Considerations

Please refer to [`SECURITY-CONSIDERATIONS.md`](SECURITY-CONSIDERATIONS.md) for details about how product-database addresses the [OWASP Top 10 Web Application Security Risks](https://owasp.org/www-project-top-ten/).

[(back to top)](#bsi-secvisogram-csaf-20-web-editor)