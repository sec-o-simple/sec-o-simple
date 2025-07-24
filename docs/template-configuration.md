# Configuration Documentation

This document describes the configuration options for the system, including API endpoints, document templates, products, and vulnerability definitions.

---

## Product Database

| Key          | Description                      | Value               |
|--------------|----------------------------------|---------------------|
| `enabled`    | Whether the product DB is active | `false`             |
| `apiUrl`     | Internal API URL                 | `http://127.0.0.1:9999` |
| `url`        | Web interface URL                | `http://127.0.0.1:3000` |

---

## CVE API

| Key        | Value                                 |
|------------|---------------------------------------|
| `cveApiUrl`| `https://cveawg.mitre.org/api/cve`    |

---

## Template Configuration

### Field Configuration

With the given suffixes fields can be configured further.

| Key                                    | Description                           |
|----------------------------------------|---------------------------------------|
| `{path}.placeholder`                   | Placeholder for field                 |
| `{path}.readonly`                      | If field is readonly                  |

### Document Information

Path: `document-information`

| Key                                    | Description                           | Values     |
|----------------------------------------|---------------------------------------|------------|
| `title`                                | Document title                        | -          |
| `tracking.status`                      | Document status                       | `draft`, `interim`, `final`|
| `language`                             | Document language                     | `en`, `de` |
| `tlp.label`                            | TLP label                             | -          |
| `tlp.url`                              | URL for TLP information               | -          | 

#### Notes (Default)

Path: `document-information.notes.default`

| Key        | Description                         | Values |
|------------|-------------------------------------|--------|
| `title`    | Default title for new notes         | -      |
| `content`  | Default content for new notes       | -      |
| `category` | Default category for new notes      | [TNoteCategory] |


#### Notes Templates

Same as **Legal Disclaimer** above.

---

### Publisher Information

Path: `document-information.publisher`

| Key                            | Description                           |
|--------------------------------|---------------------------------------|
| `readonly`                     | If publisher section is readonly      |
| `name`                         | Publisher name                        |
| `category`                     | Publisher category                    |
| `namespace`                    | Publisher namespace URL               |
| `contactDetails`               | Contact information                   |
| `issuingAuthority`             | Issuing authority                     |

---

### References

- **Example Reference**
  - `id`: `examplereference`
  - `summary`: `"Example Reference"`
  - `url`: `"https://example.com"`
  - `origin`: `"external"`

---

## Products

A hierarchical list of vendors, products, and versions.

- **Vendor: Example vendor**
  - `id`: `vendor1`
  - `category`: `vendor`
  - `readonly`: `true`

  - **Product: Product A**
    - `id`: `product1`
    - `category`: `product_name`
    - `type`: `Software`
    - `readonly`: `true`

    - **Version: 1.0.0**
      - `id`: `version1`
      - `category`: `product_version`
      - `description`: `"Initial product version"`
      - `readonly`: `true`

---

## Vulnerabilities

### Defaults

#### Products (Default)

Path: `vulnerabilities.products.default`

| Key        | Description                         | Values                     |
|------------|-------------------------------------|----------------------------|
| `status`   | Default status for prodcuts         | `known_affected`, `known_not_affected`, `fixed`, `under_investigation` |


#### Remediations (Default)

Path: `vulnerabilities.remediations.default`

| Key        | Description                         | Values                     |
|------------|-------------------------------------|----------------------------|
| `category` | Default category for remediations   | `mitigation`, `no_fix_planned`, `none_available`, `vendor_fix`, `workaround` |

---

### Defined Vulnerabilities

Path: `vulnerabilities.[]`

- **Vulnerability 1**
  - `id`: `v1`
  - `readonly`: `true`
  - `cve`: `CVE-2025-30073`
  - `cwe`: `CWE1`
  - `title`: `"Vulnerability 1"`

  - **Notes**
    - `id`: `description`
    - `category`: `description`
    - `title`: `"Vulnerability Description"`
    - `content`: Description of transaction reference reuse vulnerability in OPC cardsystems Webapp Aufwertung 2.1.0.

---

### Vulnerability Note Templates

Path: `vulnerabilities.notes_templates`

| Key        | Description                      | Value               |
|------------|----------------------------------|---------------------|
| `id`       | ID of Note                       | -             |
| `category` | Category of Note                 |  |
| `title`    | Title of Note                    | - |
| `content`  | Content of Note                  | - |


- **Template**
  - `id`: `id`
  - `category`: `description`
  - `title`: `"Vulnerability Description"`
  - `content`: `"This is a description of the vulnerability."`
  
[TNoteCategory]: description, details, faq, general, legal_disclaimer, other, summary