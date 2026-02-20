import Mustache from 'mustache'
import HTMLTemplateRaw from './HTMLTemplate/Template.html?raw'
import { TCSAFDocument } from '@/utils/csafExport/csafExport'
import { HTMLTemplateTranslations } from './htmlTemplateTranslations'

const getProductStatusHeader = () => `
<thead>
  <tr>
    <th>{{t_product}}</th>
    <th>{{t_cvss_vector}}</th>
    <th>{{t_cvss_base_score}}</th>
  </tr>
</thead>`

const PRODUCT_STATUS_ROW = `
<tr>
  <td>{{name}}</td>
  <td>{{vectorString}}</td>
  <td>{{baseScore}}</td>
</tr>`

const getRemediation = () => `
<h5>{{#replaceUnderscores}}{{#upperCase}}{{category}}{{/upperCase}}{{/replaceUnderscores}}{{#date}} ({{.}}){{/date}}</h5>
<p>{{{details}}}</p>
{{#product_ids.length}}
  <h6>{{t_for_products}}:</h6>
  <ul>
  {{#product_ids}}
    <li>{{name}}</li>
  {{/product_ids}}
  </ul>
{{/product_ids.length}}
{{#group_ids.length}}
  <h6>{{t_for_groups}}:</h6>
  <ul>
  {{#group_ids}}
   <li>{{name}}</li>
  {{/group_ids}}
  </ul>
{{/group_ids.length}}
<p>{{#url}}{{> url }}{{/url}}</p>
{{#entitlements}}
  <p>{{{.}}}</p>
{{/entitlements}}
{{#restart_required}}
  {{t_restart_required}}: <b>{{category}}</b>
  <p>{{{details}}}</p>
{{/restart_required}}`

const getThreat = () => `
<h5>{{#replaceUnderscores}}{{#upperCase}}{{category}}{{/upperCase}}{{/replaceUnderscores}}{{#date}} ({{.}}){{/date}}</h5>
<p>{{{details}}}</p>
{{#product_ids.length}}
  <h6>{{t_for_products}}:</h6>
  <ul>
  {{#product_ids}}
    <li>{{name}}</li>
  {{/product_ids}}
  </ul>
{{/product_ids.length}}
{{#group_ids.length}}
  <h6>{{t_for_groups}}:</h6>
  <ul>
  {{#group_ids}}
   <li>{{name}}</li>
  {{/group_ids}}
  </ul>
{{/group_ids.length}}`

const VULNERABILITY_NOTE = `{{#title}}<b>{{.}}</b>{{/title}}{{#audience}} ({{.}}){{/audience}}
{{#text}}<p>{{{text}}}</p>{{/text}}`

const DOCUMENT_NOTE = `{{#title}}<h2>{{.}}</h2>{{/title}}
{{#audience}}<small>{{.}}</small>{{/audience}}
{{#text}}<p>{{{text}}}</p>{{/text}}`

const ACKNOWLEDGEMENT = `
{{#.}}
  <li>{{#removeTrailingComma}}{{#names}}{{.}}, {{/names}}{{/removeTrailingComma}}{{#organization}}{{#names.length}} {{t_from}} {{/names.length}}{{.}} {{/organization}}{{#summary}} {{t_for}} {{{.}}}{{/summary}}{{#urls.length}} ({{t_see}}: {{#removeTrailingComma}}{{#urls}}{{> url}}, {{/urls}}{{/removeTrailingComma}}){{/urls.length}}</li>
{{/.}}`

const REFERENCE = `
{{#.}}
  <li>{{{summary}}} {{#category}} ({{#replaceUnderscores}}{{.}}{{/replaceUnderscores}}){{/category}}{{#url}}{{> url}}{{/url}}</li>
{{/.}}`

const URL = `
{{#.}}
  <a {{#secureHref}}{{.}}{{/secureHref}}>{{.}}</a>
{{/.}}
`

export default function HTMLTemplate({
  document,
  translations,
}: {
  document: TCSAFDocument
  translations: HTMLTemplateTranslations
}) {
  const documentWithTranslations = {
    ...document,
    ...translations,
    // Custom Mustache functions for template rendering
    removeTrailingComma: () => {
      return function (text: string, render: (text: string) => string) {
        var textWithTrailingComma = /** @type {string} */ render(text)
        const lastIndex = textWithTrailingComma.lastIndexOf(',')
        return lastIndex > 0
          ? textWithTrailingComma.substring(0, lastIndex)
          : textWithTrailingComma
      }
    },
    upperCase: () => {
      return function (text: string, render: (text: string) => string) {
        var renderedText = render(text)
        return renderedText.charAt(0).toUpperCase() + renderedText.slice(1)
      }
    },
    replaceUnderscores: () => {
      return function (text: string, render: (text: string) => string) {
        var renderedText = render(text)
        return renderedText.replaceAll('_', ' ')
      }
    },
    secureHref: () => {
      return function (text: string, render: (text: string) => string) {
        const href = render(text)
        let isValid = false

        const validStarts = ['#', 'mailto', 'tel', 'http', 'ftp']
        const validMimeTypes = [
          'image/png;base64,',
          'image/jpeg;base64,',
          'image/gif;base64,',
        ].map((x) => x.replaceAll('/', '&#x2F;'))
        validStarts.forEach((x) => (isValid = isValid || href.startsWith(x)))
        const isBase64 = (value: string) =>
          /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/.test(
            value,
          )
        validMimeTypes.forEach((mimeType) => {
          const isValidDataHref =
            href.startsWith(`data:${mimeType}`) &&
            isBase64(href.split(',')[1]?.replaceAll('&#x3D;', '='))
          isValid = isValid || isValidDataHref
        })

        return isValid ? `href="${href}"` : ''
      }
    },
  }

  return Mustache.render(HTMLTemplateRaw, documentWithTranslations, {
    product_status_header: getProductStatusHeader(),
    product_status_row: PRODUCT_STATUS_ROW,
    remediation: getRemediation(),
    threat: getThreat(),
    vulnerability_note: VULNERABILITY_NOTE,
    document_note: DOCUMENT_NOTE,
    acknowledgment: ACKNOWLEDGEMENT,
    reference: REFERENCE,
    url: URL,
  })
}
