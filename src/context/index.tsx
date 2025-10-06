'use client'

import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import {
  optimism,
  zksync,
  base,
  arbitrum,
  gnosis,
  polygon,
  polygonZkEvm,
  mantle,
  celo,
  avalanche,
  degen,
  sepolia,
  optimismSepolia,
  arbitrumSepolia,
  baseSepolia,
} from '@reown/appkit/networks'
import { type ReactNode, memo } from 'react'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { useTheme } from './ThemeContext'

const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
}

const ethersAdapter = new EthersAdapter()

createAppKit({
  adapters: [ethersAdapter],
  projectId,
  networks: [
    optimism,
    zksync,
    base,
    arbitrum,
    gnosis,
    polygon,
    polygonZkEvm,
    mantle,
    celo,
    avalanche,
    degen,
    sepolia,
    optimismSepolia,
    arbitrumSepolia,
    baseSepolia,
  ],
  defaultNetwork: sepolia,
  metadata: {
    name: 'My Faithful Assistant',
    description: 'Build your own assistant in a few seconds.',
    url: 'https://rukh-ui.netlify.app',
    icons: ['./favicon.ico'],
  },
  enableEIP6963: true,
  enableCoinbase: true,
})

const ChakraWrapper = memo(function ChakraWrapper({ children }: { children: ReactNode }) {
  const { mode } = useTheme()

  const theme = extendTheme({
    config: {
      initialColorMode: 'light',
      useSystemColorMode: false,
    },
    styles: {
      global: {
        body: {
          bg: mode === 'dark' ? '#000000' : 'white',
          color: mode === 'dark' ? 'white' : 'black',
        },
      },
    },
    colors: {
      brand: {
        peach: '#FDD69D',
        blue: '#45a2f8',
        purple: '#8c1c84',
      },
    },
  })

  return <ChakraProvider theme={theme}>{children}</ChakraProvider>
})

const ContextProvider = memo(function ContextProvider({ children }: { children: ReactNode }) {
  return <ChakraWrapper>{children}</ChakraWrapper>
})

export default ContextProvider
