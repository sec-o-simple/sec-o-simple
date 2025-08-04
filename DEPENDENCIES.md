## Dependencies

This project is frontend-only. Dependencies are categorized into runtime (what ships with the app) and development/tooling.

### Runtime / Production Dependencies

| Package | Purpose |
|--------|---------|
| `react`, `react-dom` | Core UI library and DOM rendering. |
| `@heroui/react` + other `@heroui/*` packages (accordion, button, input, modal, etc.) | Design system and accessible UI components for consistent look and feel. |
| `tailwind-merge` | Merging of Tailwind CSS class strings to resolve conflicts deterministically. |
| `zustand` | Lightweight state management for shared and persistent application state. |
| `@secvisogram/csaf-validator-lib` | Input validation enforcing schema and rule compliance before processing. |
| `framer-motion`, `motion` | Declarative animation primitives for UI transitions. |
| `i18next`, `react-i18next` | Internationalization and localization infrastructure. |
| `axios` | HTTP client for external requests to the product-database |
| `lodash.merge` | Deep merging of objects for configuration and state composition. |
| `semver` | Semantic version parsing and comparison. |
| `uid` | Generation of compact unique identifiers. |
| `cvss4` | Security severity scoring based on CVSS v4. |
| `@fortawesome/free-regular-svg-icons`, `@fortawesome/free-solid-svg-icons`, `@fortawesome/react-fontawesome` | Iconography and vector symbols for UI presentation. |
| `@internationalized/date` | Internationalized date handling utilities. |

### Development / Tooling Dependencies

| Package | Purpose |
|--------|---------|
| `vite` | Development server and build tool for frontend assets. |
| `typescript` | Static javascript typing and compile-time checks. |
| `eslint` + plugins (`@typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-tailwindcss`, etc.) | Linting and code quality enforcement. |
| `prettier`, `prettier-plugin-tailwindcss` | Opinionated code formatting with Tailwind-aware class ordering. |
| `@nabla/vite-plugin-eslint` | ESLint integration into the Vite pipeline. |
| `@vitejs/plugin-react-swc` | React support in Vite via the SWC compiler. |
| `postcss`, `autoprefixer` | CSS processing pipeline required by Tailwind. |
| `cypress` | End-to-end testing framework. |
| `@types/*` (e.g., `@types/react`, `@types/react-dom`, `@types/node`) | Type definitions for TypeScript interoperability with external libraries. |