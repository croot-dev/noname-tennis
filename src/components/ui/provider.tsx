'use client'

import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from '@chakra-ui/react'
import { ColorModeProvider, type ColorModeProviderProps } from './color-mode'
import { AlertDialogProvider } from './alert-dialog'
import { fullcourtHex } from '@/theme/fullcourt.colors'

export function Provider(props: ColorModeProviderProps) {
  const config = defineConfig({
    globalCss: {
      '*': {
        touchAction: 'manipulation',
      },
    },
    theme: {
      tokens: {
        colors: {
          fullcourt: {
            pageBg: { value: fullcourtHex.pageBg },
            sectionBg: { value: fullcourtHex.sectionBg },
            cardBg: { value: fullcourtHex.cardBg },
            border: { value: fullcourtHex.border },
            text: { value: fullcourtHex.text },
            textSoft: { value: fullcourtHex.textSoft },
            textMuted: { value: fullcourtHex.textMuted },
            accentBg: { value: fullcourtHex.accentBg },
            accentText: { value: fullcourtHex.accentText },
            pointBlue: { value: fullcourtHex.pointBlue },
            pointGreen: { value: fullcourtHex.pointGreen },
            pointGreenSoft: { value: fullcourtHex.pointGreenSoft },
            pointAmber: { value: fullcourtHex.pointAmber },
            pointAmberSoft: { value: fullcourtHex.pointAmberSoft },
            buttonPrimaryBg: { value: fullcourtHex.buttonPrimaryBg },
            buttonPrimaryHover: { value: fullcourtHex.buttonPrimaryHover },
            buttonPrimaryText: { value: fullcourtHex.buttonPrimaryText },
            buttonOutlineBorder: { value: fullcourtHex.buttonOutlineBorder },
            buttonOutlineHover: { value: fullcourtHex.buttonOutlineHover },
            footerBg: { value: fullcourtHex.footerBg },
          },
        },
      },
      recipes: {
        textarea: {
          defaultVariants: {
            size: 'lg',
          },
        },
        input: {
          defaultVariants: {
            size: 'lg',
          },
        },
      },
    },
  })
  const system = createSystem(defaultConfig, config)

  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} forcedTheme="light" enableSystem={false}>
        <AlertDialogProvider>{props.children}</AlertDialogProvider>
      </ColorModeProvider>
    </ChakraProvider>
  )
}
