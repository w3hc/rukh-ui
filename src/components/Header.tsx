'use client'

import { Box, Container, Flex, Heading, Portal } from '@chakra-ui/react'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { MenuRoot, MenuTrigger, MenuPositioner, MenuContent, MenuItem } from '@/components/ui/menu'
import Link from 'next/link'
import { HiMenu } from 'react-icons/hi'
import LanguageSelector from './LanguageSelector'
import LoginButton from './LoginButton'
import { useTranslation } from '@/hooks/useTranslation'
import { useW3PK } from '@/context/W3PK'
import { useState, useEffect } from 'react'
import { brandColors } from '@/theme'

export default function Header() {
  const { isAuthenticated, user, isLoading, logout } = useW3PK()
  const t = useTranslation()

  const [scrollPosition, setScrollPosition] = useState(0)

  const shouldSlide = scrollPosition > 0
  const leftSlideValue = shouldSlide ? 2000 : 0
  const rightSlideValue = shouldSlide ? 2000 : 0

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      <Box as="header" py={4} position="fixed" w="100%" top={0} zIndex={10} overflow="visible">
        <Container maxW="100%" px={{ base: 4, md: 6 }} overflow="visible">
          <Flex
            as="nav"
            aria-label={t.header.mainNavAriaLabel}
            justify="space-between"
            align="center"
            overflow="visible"
          >
            <Box
              transform={`translateX(-${leftSlideValue}px)`}
              transition="transform 0.5s ease-in-out"
              suppressHydrationWarning
            >
              <Flex align="center" gap={3}>
                <Link href="/">
                  <Flex align="center" gap={5}>
                    <Heading as="h3" size="md" textAlign="center">
                      Rukh
                    </Heading>
                  </Flex>
                </Link>
              </Flex>
            </Box>

            <Flex
              gap={2}
              align="center"
              transform={`translateX(${rightSlideValue}px)`}
              transition="transform 0.5s ease-in-out"
              suppressHydrationWarning
            >
              {!isAuthenticated ? (
                <LoginButton size="xs" px={4} />
              ) : (
                <>
                  {/* <Box>
                    <Text fontSize="sm" color="gray.300">
                      {user?.displayName || user?.username}
                    </Text>
                  </Box> */}
                  <Button
                    bg={brandColors.primary}
                    color="white"
                    _hover={{
                      bg: brandColors.secondary,
                    }}
                    onClick={handleLogout}
                    size="xs"
                    ml={4}
                    px={4}
                  >
                    {t.common.logout}
                  </Button>
                </>
              )}
              <MenuRoot>
                <MenuTrigger asChild>
                  <IconButton aria-label={t.header.optionsAriaLabel} variant="ghost" size="sm">
                    <HiMenu />
                  </IconButton>
                </MenuTrigger>
                <Portal>
                  <MenuPositioner>
                    <MenuContent minWidth="auto">
                      <Link href="/dashboard" color="white">
                        <MenuItem value="dashboard" fontSize="md" px={4} py={3}>
                          Dashboard
                        </MenuItem>
                      </Link>
                      <Link href="/settings" color="white">
                        <MenuItem value="settings" fontSize="md" px={4} py={3}>
                          {t.navigation.settings}
                        </MenuItem>
                      </Link>
                    </MenuContent>
                  </MenuPositioner>
                </Portal>
              </MenuRoot>
              <LanguageSelector />
            </Flex>
          </Flex>
        </Container>
      </Box>
    </>
  )
}
