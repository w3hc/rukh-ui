'use client'

import React from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { Language } from '@/utils/i18n'
import { IconButton, Menu, MenuButton, MenuList, MenuItem, Text, Flex, Box } from '@chakra-ui/react'
import { MdLanguage } from 'react-icons/md'
import { useTheme } from '@/context/ThemeContext'

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage()
  const { mode } = useTheme()

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang)
  }

  const languageInfo = [
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'ar', name: 'العربية' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'ru', name: 'Русский' },
    { code: 'pt', name: 'Português' },
    { code: 'ur', name: 'اردو' },
  ]

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Select language"
        icon={<MdLanguage size="1.2em" />}
        variant="ghost"
        size="sm"
        color={mode === 'dark' ? 'white' : 'black'}
        _hover={{
          bg: mode === 'dark' ? 'whiteAlpha.200' : 'blackAlpha.100',
        }}
      />
      <MenuList
        maxH="300px"
        overflowY="auto"
        minWidth="auto"
        bg={mode === 'dark' ? 'gray.800' : 'white'}
      >
        {languageInfo.map(({ code, name }) => (
          <MenuItem
            key={code}
            onClick={() => handleLanguageChange(code as Language)}
            bg={
              language === code
                ? mode === 'dark'
                  ? 'whiteAlpha.200'
                  : 'blackAlpha.100'
                : undefined
            }
            _hover={{ bg: mode === 'dark' ? 'whiteAlpha.300' : 'blackAlpha.200' }}
          >
            <Flex align="center" justify="space-between">
              <Box>
                <Text display="inline">{name}</Text>
              </Box>
              {language === code && (
                <Text fontSize="sm" color="green.300" ml={2}>
                  ✓
                </Text>
              )}
            </Flex>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  )
}

export default LanguageSelector
