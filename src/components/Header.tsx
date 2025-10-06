'use client'

import {
  Box,
  Button,
  Flex,
  Heading,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react'
import { useAppKit } from '@reown/appkit/react'
import { useAppKitAccount, useDisconnect } from '@reown/appkit/react'
import Link from 'next/link'
import { HamburgerIcon } from '@chakra-ui/icons'
import LanguageSelector from './LanguageSelector'
import { useTranslation } from '@/hooks/useTranslation'
import { useState, useEffect } from 'react'

export default function Header() {
  const { open } = useAppKit()
  const { isConnected, address } = useAppKitAccount()
  const { disconnect } = useDisconnect()
  const t = useTranslation()

  const [scrollPosition, setScrollPosition] = useState(0)

  const slideThreshold = 50
  const leftSlideValue =
    scrollPosition <= slideThreshold ? 0 : Math.min((scrollPosition - slideThreshold) * 0.5, 100)

  const rightSlideValue =
    scrollPosition <= slideThreshold ? 0 : Math.min((scrollPosition - slideThreshold) * 0.5, 100)

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleConnect = () => {
    try {
      open({ view: 'Connect' })
    } catch (error) {
      console.error('Connection error:', error)
    }
  }

  const handleDisconnect = () => {
    try {
      disconnect()
    } catch (error) {
      console.error('Disconnect error:', error)
    }
  }

  return (
    <Box as="header" py={4} position="fixed" w="100%" top={0} zIndex={10}>
      <Flex justify="space-between" align="center" px={4}>
        <Box
          transform={`translateX(-${leftSlideValue}px)`}
          opacity={Math.max(1 - leftSlideValue / 100, 0)}
          transition="all 0.5s ease-in-out"
        >
          <Link href="/">
            <Heading as="h3" size="md" textAlign="center">
              Mon assistant
            </Heading>
          </Link>
        </Box>

        <Flex
          gap={2}
          align="center"
          transform={`translateX(${rightSlideValue}px)`}
          opacity={Math.max(1 - rightSlideValue / 100, 0)}
          transition="all 0.5s ease-in-out"
        >
          {/* {!isConnected ? (
            <Button
              bg="#8c1c84"
              color="white"
              _hover={{
                bg: '#6d1566',
              }}
              onClick={handleConnect}
              size="sm"
            >
              {t.common.login}
            </Button>
          ) : (
            <>
              <Box transform="scale(0.85)" transformOrigin="right center">
                {/* <appkit-network-button /> */}
          {/* </Box> */}
          {/* <Button
            bg="#8c1c84"
            color="white"
            _hover={{
              bg: '#6d1566',
            }}
            onClick={handleDisconnect}
            size="sm"
            ml={4}
          >
            {t.common.logout}
          </Button> */}
          {/* </> */}

          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<HamburgerIcon />}
              variant="ghost"
              size="sm"
            />

            <MenuList>
              <Link href="/menuiserie" color="white">
                <MenuItem fontSize="sm">Menuiserie</MenuItem>
              </Link>
              <MenuItem fontSize="sm" isDisabled>
                Plomberie
              </MenuItem>
              <MenuItem fontSize="sm" isDisabled>
                Électricité
              </MenuItem>
              <MenuItem fontSize="sm" isDisabled>
                Maçonnerie
              </MenuItem>
              <MenuItem fontSize="sm" isDisabled>
                Charpenterie
              </MenuItem>
              <MenuItem fontSize="sm" isDisabled>
                Couverture
              </MenuItem>
              <MenuItem fontSize="sm" isDisabled>
                Plâtrerie
              </MenuItem>
              <MenuItem fontSize="sm" isDisabled>
                Peinture
              </MenuItem>
              <MenuItem fontSize="sm" isDisabled>
                Carrelage
              </MenuItem>
              <MenuItem fontSize="sm" isDisabled>
                Chauffage
              </MenuItem>
              <MenuItem fontSize="sm" isDisabled>
                Climatisation
              </MenuItem>
              <MenuItem fontSize="sm" isDisabled>
                Isolation
              </MenuItem>
              <MenuItem fontSize="sm" isDisabled>
                Serrurerie
              </MenuItem>
              <MenuItem fontSize="sm" isDisabled>
                Métallerie
              </MenuItem>
              <MenuItem fontSize="sm" isDisabled>
                Vitrerie
              </MenuItem>
              <MenuItem fontSize="sm" isDisabled>
                Parqueteur
              </MenuItem>
              <MenuItem fontSize="sm" isDisabled>
                Ravalement
              </MenuItem>
              <MenuItem fontSize="sm" isDisabled>
                Terrassement
              </MenuItem>
              <MenuItem fontSize="sm" isDisabled>
                VRD
              </MenuItem>
              <MenuItem fontSize="sm" isDisabled>
                Zinguerie
              </MenuItem>
              <MenuItem fontSize="sm" isDisabled>
                Étanchéité
              </MenuItem>
              <MenuItem fontSize="sm" isDisabled>
                Façadier
              </MenuItem>
            </MenuList>
          </Menu>
          <LanguageSelector />
        </Flex>
      </Flex>
    </Box>
  )
}
