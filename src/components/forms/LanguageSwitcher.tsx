import { Button, ButtonGroup } from '@heroui/react'
import { Select, SelectItem } from '@heroui/select'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()

  const changeLanguage = useCallback(
    (lang: string) => {
      i18n.changeLanguage(lang)
      localStorage.setItem('i18nextLng', lang)
    },
    [i18n],
  )

  const languages = Object.keys(i18n.store.data).sort()

  if (languages.length > 2) {
    return (
      <Select
        aria-label={t('document.general.language')}
        className="w-32 mx-auto"
        onChange={(e) => changeLanguage(e.target.value)}
        selectedKeys={[i18n.language]}
        size="sm"
      >
        {languages.map((lang) => (
          <SelectItem key={lang}>
            {t(`document.general.languages.${lang}`, lang.toUpperCase())}
          </SelectItem>
        ))}
      </Select>
    )
  }

  return (
    <ButtonGroup>
      {languages.map((lang) => (
        <Button
          key={lang}
          size="sm"
          color={i18n.language === lang ? 'primary' : 'secondary'}
          onPress={() => changeLanguage(lang)}
        >
          {lang.toUpperCase()}
        </Button>
      ))}
    </ButtonGroup>
  )
}
