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
          primary: '#3084f2',  // Blue - Trust
          accent: '#f2b90f',   // Orange - Dynamism
          secondary: '#102540',  // Blue - Trust

          gray: '#cacbcc',

          white: '#fcfdff',
          black: '#0d0d0d',

          success: '#43A047',   // Green - Success
          warning: '#FB8C00',   // Amber - Warnings
          error: '#E53935',     // Red - Errors
          background: '#FFFFFF', // White background for light theme
          surface: '#F2F2F2',    // Light grey surface
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
      color: 'secondary',
    },
    VCardActions: {
      VBtn: { variant: 'tonal', color: 'secondary', },
    },
    VToolBar: {
      VBtn: { variant: 'tonal', color: 'secondary', }
    },
    VDialog: {
      VBtn: { variant: 'tonal', color: 'secondary', }
    },
    VCard: {
      VTextField: {
        color: 'secondary',
        density: 'compact',
        variant: 'outlined',

      },
      // VCardTitle: {
      //   class: 'text-secondary',
      // },
      VCheckbox: {
        color: 'secondary',
      },
      VRadioGroup: {
        color: 'secondary',
      },
      VDateInput: {
        density: 'compact',
        variant: 'outlined',
      }
    },
    VTextField: {
      color: 'secondary',
      density: 'compact',
      variant: 'outlined',
    },
    VSelect: {
      color: 'secondary',
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
