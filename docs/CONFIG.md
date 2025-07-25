# Configuration Documentation

This document describes the configuration options for the system, including API endpoints, document templates, products, and vulnerability definitions.

## API Endpoints

### Product Database

**Root Path:** `productDatabase`

| Key        | Description                               | Example Value              |
|------------|-------------------------------------------|----------------------------|
| `enabled`  | Enable/disable the internal product DB    | `true` / `false`           |
| `apiUrl`   | Internal API endpoint for product access  | `http://127.0.0.1:9999`    |
| `url`      | Web interface for managing products       | `http://127.0.0.1:3000`    |

### CVE API

| Key         | Example Value                          |
|-------------|----------------------------------------|
| `cveApiUrl` | `https://cveawg.mitre.org/api/cve`     |

### Export Texts

**Root Path:** `exportTexts.productDescription`

These texts are used as a prefix to export product descriptions

| Key         | Example Value                          |
|-------------|----------------------------------------|
| `de` | `Produktbeschreibung für`     |
| `en` | `Product description for`     |

---

## Template Configuration

**Root Path:** `template`

### Generic Field Modifiers

The following suffixes can be appended to most fields to enhance configurability:

| Suffix               | Description                         |
|----------------------|-------------------------------------|
| `.placeholder`       | UI placeholder text for the field   |
| `.readonly`          | Marks the field as read-only        |

### Document Information

**Path:** `document-information`

| Key                          | Description                   | Values                        |
|------------------------------|-------------------------------|-------------------------------|
| `title`                      | Document title                | `string`                      |
| `tracking.status`            | Document status               | `draft`, `interim`, `final`   |
| `language`                   | Document language             | `en`, `de`                    |
| `tlp.label`                  | TLP label                     | `string`                      |
| `tlp.url`                    | TLP reference URL             | `string`                      |

### Notes (Default)

**Path:** `document-information.notes.default`

| Key         | Description                          | Allowed Values                                               |
|-------------|--------------------------------------|--------------------------------------------------------------|
| `title`     | Default note title                   | `string`                                                     |
| `content`   | Default content                      | `string`                                                     |
| `category`  | Default note type                    | `description`, `details`, `faq`, `general`, `legal_disclaimer`, `other`, `summary` |

### Note Templates

**Path:** `document-information.notes_templates[]`

| Key        | Description             | Values                                                            |
|------------|-------------------------|-------------------------------------------------------------------|
| `id`       | Note ID.                | `string`                                                          |
| `title`    | Note title              | `string`                                                          |
| `content`  | Note content            | `string`                                                          |
| `category` | Note type               | `description`, `details`, `faq`, `general`, `legal_disclaimer`, `summary` |
| `readonly` | If the note is locked   | `true`, `false`                                                   |

---

### Publisher Information

**Path:** `document-information.publisher`

| Key                        | Description                         | Values                                          |
|----------------------------|-------------------------------------|-------------------------------------------------|
| `readonly`                 | If publisher block is read-only     | `true`, `false`                                 |
| `name`                     | Publisher name                      | `string`                                        |
| `category`                 | Publisher category                      | `coordinator`, `discoverer`, `other`, `translator`, `user`, `vendor` |
| `namespace`                | Publisher namespace URI                      | `string`                                  |
| `contactDetails`          | Contact information                | `string`                                        |
| `issuingAuthority`        | Issuing organization               | `string`                                        |

### References

**Path:** `document-information.references[]`

| Key       | Description             | Values                       |
|-----------|-------------------------|------------------------------|
| `id`      | Reference ID            | `string`                     |
| `summary` | Summary of reference    | `string`                     |
| `url`     | Link to reference       | `string`                     |
| `origin`  | Source of reference     | `self`, `external`           |

---

## Products

### Vendors

**Path:** `products[]`

| Key         | Description              | Values        |
|-------------|--------------------------|---------------|
| `id`        | Vendor ID                | `string`      |
| `category`  | Type (must be `vendor`)  | `vendor`      |
| `name`      | Vendor name              | `string`      |
| `readonly`  | Read-only flag           | `boolean`     |
| `subBranches` | Contained products     | `array`       |

### Products

**Path:** `products[].subBranches[]`

| Key           | Description           | Values                      |
|----------------|-----------------------|------------------------------|
| `id`          | Product ID            | `string`                    |
| `category`    | Must be `product_name`| `product_name`              |
| `name`        | Product name          | `string`                    |
| `description` | Short description     | `string`                    |
| `type`        | Product type          | `software`, `hardware`      |
| `readonly`    | Read-only flag        | `boolean`                   |
| `subBranches` | Product versions      | `array`                     |

### Versions

**Path:** `products[].subBranches[].subBranches[]`

| Key        | Description             | Values             |
|------------|-------------------------|--------------------|
| `id`       | Version ID              | `string`           |
| `category` | Must be `product_version`| `product_version`  |
| `name`     | Version name            | `string`           |
| `readonly` | Read-only flag.         | `boolean`          |

---

## Vulnerabilities

### Defaults

#### Notes

**Path:** `vulnerabilities.notes.default`

| Key        | Description              | Values                                    |
|------------|--------------------------|-------------------------------------------|
| `title`    | Default note title       | `string`                                  |
| `content`  | Default content          | `string`                                  |
| `category` | Note category            | `description`, `details`, `faq`, `general`, `legal_disclaimer`, `summary` |

#### Products

**Path:** `vulnerabilities.products.default`

| Key      | Description                | Values                                    |
|----------|----------------------------|-------------------------------------------|
| `status` | Default product status     | `known_affected`, `known_not_affected`, `fixed`, `under_investigation` |

#### Remediations

**Path:** `vulnerabilities.remediations.default`

| Key        | Description                  | Values                                          |
|------------|------------------------------|-------------------------------------------------|
| `category` | Default remediation category     | `mitigation`, `no_fix_planned`, `none_available`, `vendor_fix`, `workaround` |

---

### Defined Vulnerabilities

**Path:** `vulnerabilities[]`

| Key        | Description                  | Values                |
|------------|------------------------------|------------------------|
| `id`       | Vulnerability ID             | `string`               |
| `readonly` | If is readonly               | `boolean`              |
| `cve`      | CVE-ID                       | `string`               |
| `cwe`      | CWE-ID                       | `string`               |
| `title`    | Vulnerability title          | `string`               |
| `notes`    | Notes (array)                | `object[]`             |
| `products` | Products (array)             | `object[]`             |

#### Notes (within vulnerability)

**Path:** `vulnerabilities[].notes[]`

| Key        | Description             | Values                  |
|------------|-------------------------|--------------------------|
| `id`       | Note ID                 | `string`                |
| `title`    | Note title              | `string`                |
| `content`  | Note content            | `string`                |
| `category` | Note type               | Same as global `category`|
| `readonly` | Read-only flag          | `boolean`               |

#### Product Status (within vulnerability)

Each key refers to an array of product IDs:

- `vulnerabilities[].products[].known_affected[]`
- `vulnerabilities[].products[].known_not_affected[]`
- `vulnerabilities[].products[].fixed[]`
- `vulnerabilities[].products[].under_investigation[]`

---

### Vulnerability Note Templates

**Path:** `vulnerabilities.notes_templates[]`

| Key        | Description             | Values                                                 |
|------------|-------------------------|--------------------------------------------------------|
| `id`       | Note ID                 | `string`                                               |
| `title`    | Note title              | `string`                                               |
| `content`  | Note content            | `string`                                               |
| `category` | Note type               | `description`, `details`, `faq`, `general`, `legal_disclaimer`, `summary` |
| `readonly` | Lock flag               | `boolean`                                              |

