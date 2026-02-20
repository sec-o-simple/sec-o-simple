import WizardStep from '@/components/WizardStep'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import HTMLTemplate from './HTMLTemplate'
import { createHTMLTemplateTranslations } from './htmlTemplateTranslations'
import { parseMarkdown } from './markdownParser'
import useDocumentStore from '@/utils/useDocumentStore'
import { createCSAFDocument } from '@/utils/csafExport/csafExport'
import { useConfigStore } from '@/utils/useConfigStore'
import { useProductTreeBranch } from '@/utils/useProductTreeBranch'
import { Tab, Tabs } from '@heroui/tabs'

export default function Preview() {
  const { t } = useTranslation()
  const [showHtml, setShowHtml] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const documentStore = useDocumentStore()
  const { getRelationshipFullProductName, getFullProductName } =
    useProductTreeBranch()
  const config = useConfigStore((store) => store.config)

  let csafDocument = createCSAFDocument(
    documentStore,
    getFullProductName,
    getRelationshipFullProductName,
    config,
  )

  const html = useMemo(() => {
    const markdownParsedDoc = parseMarkdown(csafDocument ?? {})

    // Create a wrapper function to handle the type mismatch
    const translationWrapper = (key: string, defaultValue?: string): string =>
      t(key, defaultValue || '') as string

    const translations = createHTMLTemplateTranslations(translationWrapper)
    return HTMLTemplate({
      document: markdownParsedDoc,
      translations,
    })
  }, [csafDocument, t])

  useEffect(() => {
    if (!iframeRef.current?.contentDocument) return
    iframeRef.current.contentDocument.open()
    iframeRef.current.contentDocument.write(html)
    iframeRef.current.contentDocument.addEventListener('focus', () => {
      iframeRef.current?.blur()
    })
    iframeRef.current.contentDocument.close()
  }, [html, showHtml])

  const boxClassNames = 'h-[600px] w-full rounded-md border border-gray-200'

  return (
    <WizardStep title={t('nav.preview')} onBack={'/tracking'} progress={5}>
      <div>
        <Tabs
          className="w-full"
          color="primary"
          variant="light"
          selectedKey={showHtml ? 'html' : 'rendered'}
          onSelectionChange={(key) => setShowHtml(key === 'html')}
        >
          <Tab key="rendered" title={t('preview.html')}>
            <div className={boxClassNames}>
              <iframe id="preview" ref={iframeRef} className="h-full w-full" />
            </div>
          </Tab>
          <Tab key="html" title={t('preview.raw')}>
            <div className={boxClassNames}>
              <pre className="h-full overflow-auto p-3 text-sm break-all whitespace-pre-wrap">
                {html}
              </pre>
            </div>
          </Tab>
        </Tabs>
      </div>
    </WizardStep>
  )
}
