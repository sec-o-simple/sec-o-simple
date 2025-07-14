import { useTranslation } from 'react-i18next'
import { Button, ButtonGroup } from '@heroui/react'
import { useCallback } from 'react'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const changeLanguage = useCallback(
    (lang: string) => {
      i18n.changeLanguage(lang)
      localStorage.setItem('i18nextLng', lang)
    },
    [i18n],
  )

  return (
    <ButtonGroup>
      <Button
        size="sm"
        color={i18n.language === 'en' ? 'primary' : 'secondary'}
        onPress={() => changeLanguage('en')}
      >
        EN
      </Button>
      <Button
        size="sm"
        color={i18n.language === 'de' ? 'primary' : 'secondary'}
        onPress={() => changeLanguage('de')}
      >
        DE
      </Button>
    </ButtonGroup>
  )
}
