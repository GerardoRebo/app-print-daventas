// resources/js/vuetify.js

import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
// import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import * as components from 'vuetify/components'
import { VDateInput } from 'vuetify/labs/VDateInput'
import * as directives from 'vuetify/directives'

export default createVuetify({
  icons: {
    defaultSet: 'mdi',
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1964cc',  // Blue - Trust
          accent: '#ea580c',   // Orange - Dynamism
          primary_l100: '#337de6',  // Blue - Trust
          primary_l200: '#498ce9',  // Blue - Trust
          primary_l300: '#609aeb',  // Blue - Trust
          primary_l400: '#77a9ee',  // Blue - Trust
          primary_l500: '#8eb7f1',  // Blue - Trust
          primary_l600: '#a4c5f4',  // Blue - Trust
          primary_l700: '#bbd4f7',  // Blue - Trust
          primary_l800: '#d2e2f9',  // Blue - Trust
          primary_l900: '#e8f1fc',  // Blue - Trust

          primary_d100: '#1964cc',  // Blue - Trust
          primary_d200: '#1659b6',  // Blue - Trust
          primary_d300: '#144e9f',  // Blue - Trust
          primary_d400: '#114388',  // Blue - Trust
          primary_d500: '#0e3872',  // Blue - Trust
          primary_d600: '#0b2c5b',  // Blue - Trust
          primary_d700: '#082144',  // Blue - Trust
          primary_d800: '#06162d',  // Blue - Trust
          primary_d900: '#030b17',  // Blue - Trust

          neutral100: '#f3f4f6',  // Blue - Trust
          neutral200: '#e2e8f0',  // Blue - Trust
          neutral300: '#cbd5e1',  // Blue - Trust
          neutral400: '#94a3b8',  // Blue - Trust
          neutral500: '#64748b',  // Blue - Trust
          neutral600: '#475569',  // Blue - Trust
          neutral700: '#334155',  // Blue - Trust

          black: '#030b17',
          success: '#43A047',   // Green - Success
          warning: '#FB8C00',   // Amber - Warnings
          error: '#E53935',     // Red - Errors
          background: '#FFFFFF', // White background for light theme
          surface: '#F2F2F2',    // Light grey surface
          'on-background': "#06162d",
          'on-surface': "#06162d",
        },

      },
    },
    dark: {
      colors: {
      },
    },

  },
  defaults: {
    VBtn: {
      variant: 'tonal', // Set your preferred default variant here
      color: 'primary_d600',
    },
    VCardActions: {
      VBtn: { variant: 'tonal', color: 'primary_d600', },
    },
    VToolBar: {
      VBtn: { variant: 'tonal', color: 'primary_d600', }
    },
    VDialog: {
      VBtn: { variant: 'tonal', color: 'primary_d600', }
    },
    VCard: {
      VTextField: {
        color: 'primary_d600',
        density: 'compact',
        variant: 'outlined',

      },
      // VCardTitle: {
      //   class: 'text-primary_d600',
      // },
      VCheckbox: {
        color: 'primary_d600',
      },
      VRadioGroup: {
        color: 'primary_d600',
      },
      VDateInput: {
        density: 'compact',
        variant: 'outlined',
      }
    },
    VTextField: {
      color: 'primary_d600',
      density: 'compact',
      variant: 'outlined',
    },
    VSelect: {
      color: 'primary_d600',
      density: 'compact',
      variant: 'outlined',
    },
    VDataTable: {
      hover: true
    },
    VTable: {
      hover: true
    },
  },
  components: {
    VDateInput,
    ...components,
  },
  directives,
  date: {
    locale: {
      es: 'es-MX',
    }
  }
})
