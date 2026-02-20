export type HTMLTemplateTranslations = {
  [key: string]: string
}

type TranslationFunction = (key: string, defaultValue?: string) => string

/**
 * Creates translation object for HTML template rendering
 */
export function createHTMLTemplateTranslations(
  t: TranslationFunction,
): HTMLTemplateTranslations {
  return {
    t_product: t('products.product.label'),
    t_cvss_vector: t('vulnerabilities.score.cvss') + '-Vector',
    t_cvss_base_score: t('vulnerabilities.score.baseScore'),
    t_for_products: t('vulnerabilities.remediation.productsDescription')
      .split(' ')
      .slice(0, 2)
      .join(' '),
    t_for_groups: t('vulnerabilities.products.groups'),
    t_restart_required: t('vulnerabilities.remediation.restartRequired'),
    t_publisher: t('nav.documentInformation.publisher'),
    t_document_category: t('document.publisher.category'),
    t_engine: t('document.engine'),
    t_initial_release_date: t('document.initialReleaseDate'),
    t_current_release_date: t('document.currentReleaseDate'),
    t_build_date: t('document.buildDate'),
    t_current_version: t('document.general.revisionHistory.version'),
    t_status: t('document.general.state'),
    t_severity: t('vulnerabilities.score.baseSeverity'),
    t_original_language: t('document.general.originalLanguage'),
    t_language: t('document.general.language'),
    t_also_referred_to: t('document.general.alias'),
    t_product_groups: t('products.productGroups'),
    t_vulnerabilities: t('nav.vulnerabilities'),
    t_product_status: t('vulnerabilities.products.status.title'),
    t_known_affected: t('vulnerabilities.products.status.known_affected'),
    t_first_affected: t('vulnerabilities.products.status.first_affected'),
    t_last_affected: t('vulnerabilities.products.status.last_affected'),
    t_known_not_affected: t(
      'vulnerabilities.products.status.known_not_affected',
    ),
    t_recommended: t('vulnerabilities.products.status.recommended'),
    t_fixed: t('vulnerabilities.products.status.fixed'),
    t_first_fixed: t('vulnerabilities.products.status.first_fixed'),
    t_under_investigation: t(
      'vulnerabilities.products.status.under_investigation',
    ),
    t_remediations: t('vulnerabilities.remediations'),
    t_acknowledgments: t('document.acknowledgments.title'),
    t_acknowledgments_from_publisher: t(
      'document.acknowledgments.fromPublisher',
    ),
    t_involvement: t('document.acknowledgments.involvement'),
    t_references: t('nav.documentInformation.references'),
    t_threats: t('vulnerabilities.threats'),
    t_revision_history: t('document.general.revisionHistory.history'),
    t_version: t('document.general.revisionHistory.version'),
    t_date_of_revision: t('document.general.revisionHistory.date'),
    t_summary_of_revision: t('document.general.revisionHistory.description'),
    t_sharing_rules: t('document.general.tlp.sharingRules'),
    t_discovery_date: t('vulnerabilities.general.discoveryDate'),
    t_release_date: t('vulnerabilities.general.releaseDate'),
    t_cwe: 'CWE',
    t_id: t('document.general.id'),
    t_namespace: t('document.publisher.namespace'),
    t_contact_details: t('document.publisher.contactDetails'),
    t_issuing_authority: t('document.publisher.issuingAuthority'),
    t_for_tlp_version_see: t('document.general.tlp.version.url'),
    t_from: t('common.from'),
    t_to: t('common.to'),
    t_for: t('common.for'),
    t_see: t('common.see'),
  }
}
