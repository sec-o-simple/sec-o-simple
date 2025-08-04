## Dependencies

This project is frontend-only. Dependencies are categorized into runtime (what ships with the app) and development/tooling.

### Runtime / Production Dependencies

| Package | Purpose |
|--------|---------|
| `react`, `react-dom` | Core UI library and DOM rendering. |
| `@heroui/react` + other `@heroui/*` packages (accordion, button, input, modal, etc.) | Design system / accessible UI components for consistent look-and-feel. |
| `tailwind-merge` | Smart merging of Tailwind CSS class strings to avoid conflicts. |
| `zustand` | Lightweight state management for shared or persistent UI state (used sparingly where needed). |
| `@secvisogram/csaf-validator-lib` | External input validation to enforce schema/rule compliance before acting on user data. |
| `framer-motion`, `motion` | Animation primitives for smooth UI transitions. |
| `i18next`, `react-i18next` | Internationalization and localization support. |
| `axios` | HTTP client (if the app talks to external APIs or backends). |
| `lodash.merge` | Deep merge utility, useful for combining configs or form state. |
| `semver` | Semantic version parsing/comparison if the app handles versioned data. |
| `uid` | Lightweight unique ID generation. |
| `cvss4` | Domain-specific scoring (e.g., for security severity) if relevant to the app’s functionality. |
| `@fortawesome/free-regular-svg-icons`, `@fortawesome/free-solid-svg-icons`, `@fortawesome/react-fontawesome` | Iconography for UI elements. |
| `@internationalized/date` | Date handling with internationalization support. |

### Development / Tooling Dependencies

| Package | Purpose |
|--------|---------|
| `vite` | Fast dev server and build tool for the frontend. |
| `typescript` | Static typing to catch issues early and improve maintainability. |
| `eslint` + plugins (`@typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-tailwindcss`, etc.) | Linting and code quality enforcement. |
| `prettier`, `prettier-plugin-tailwindcss` | Code formatting with Tailwind-aware ordering. |
| `@nabla/vite-plugin-eslint` | Integrates ESLint feedback into the Vite build/dev pipeline. |
| `@vitejs/plugin-react-swc` | React support in Vite using the fast SWC compiler. |
| `postcss`, `autoprefixer` | CSS processing pipeline used by Tailwind. |
| `cypress` | End-to-end testing framework. |
| `@types/*` (e.g., `@types/react`, `@types/react-dom`, `@types/node`) | Type definitions to support TypeScript for third-party libraries. |

### Notes

- **State management:** Zustand is intentionally lightweight and only used where sharing or persistence makes sense; local component state is preferred otherwise.  
- **Validation:** All external/user input is gatekept by `csaf-validator-lib` to avoid invalid data flow.  
- **Styling:** Tailwind is used declaratively; `tailwind-merge` helps avoid class name conflicts especially when composing dynamic class strings.  
- **Dev ergonomics:** ESLint + Prettier (with Tailwind plugin) keep code consistent; Vite provides rapid feedback during development.

