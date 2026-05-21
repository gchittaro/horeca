import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'chr-nuit':    '#26215C',
        'chr-profond': '#3C3489',
        'chr-anchor':  '#534AB7',
        'chr-primary': '#7F77DD',
        'chr-soft':    '#AFA9EC',
        'chr-muted':   '#CECBF6',
        'chr-tint':    '#EEEDFE',
        'chr-surface': '#F8F8FC',
        'chr-up':      '#E24B4A',
        'chr-up-bg':   '#FCEBEB',
        'chr-down':    '#639922',
        'chr-down-bg': '#EAF3DE',
        'chr-warn':    '#BA7517',
        'chr-warn-bg': '#FAEEDA',
        'chr-geo':     '#1D9E75',
        'chr-geo-bg':  '#E1F5EE',
      },
    },
  },
  plugins: [],
}

export default config
