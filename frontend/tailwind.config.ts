import type { Config } from 'tailwindcss'

/**
 * 「書架 (Reading Room)」デザインシステム
 * 紙・革装丁・図書室の真鍮ランプを想起させる温かいトークン群。
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ブランド: 深い「図書館グリーン」(革装丁・蔵書ラベル)
        brand: {
          50: '#eef4f0',
          100: '#d3e4da',
          200: '#a7c9b6',
          300: '#73a98c',
          400: '#478a68',
          500: '#2c6e4e',
          600: '#1f5a3e',
          700: '#194930',
          800: '#143a27',
          900: '#0e2a1d',
        },
        // アクセント: 真鍮 / 箔押しの金 (ランプ・ラベル)
        brass: {
          50: '#fbf4e4',
          100: '#f3e3bf',
          200: '#e8cd8c',
          300: '#dab455',
          400: '#c89a2f',
          500: '#a87d22',
          600: '#86621c',
        },
        // テキスト: 温黒と段階的ミュート
        ink: {
          DEFAULT: '#23201b',
          soft: '#564f44',
          faint: '#857c6b',
        },
        // 背景: 温かい紙色
        paper: {
          DEFAULT: '#f7f3ec',
          dark: '#efe9dd',
        },
        // カード面: ほのかにクリーム寄りの白
        surface: {
          DEFAULT: '#fffdf9',
          raised: '#ffffff',
        },
        // 罫線: 温かいベージュグレー
        line: {
          DEFAULT: '#e5dccd',
          strong: '#d6cab4',
        },
        // ステータス(貸出中・破壊操作): テラコッタ
        clay: {
          50: '#f8eae3',
          100: '#f0d6c8',
          500: '#c05f3c',
          600: '#a8492a',
          700: '#8c3a20',
        },
      },
      fontFamily: {
        sans: [
          '"Zen Kaku Gothic New"',
          '"Hiragino Kaku Gothic ProN"',
          'Meiryo',
          'system-ui',
          'sans-serif',
        ],
        serif: [
          '"Shippori Mincho"',
          '"Hiragino Mincho ProN"',
          'YuMincho',
          'serif',
        ],
      },
      boxShadow: {
        card: '0 1px 2px rgba(35,32,27,0.04), 0 6px 20px -12px rgba(35,32,27,0.18)',
        raised: '0 18px 40px -20px rgba(20,58,39,0.45)',
        header: '0 1px 0 rgba(0,0,0,0.04), 0 8px 24px -16px rgba(14,42,29,0.5)',
      },
      backgroundImage: {
        // ごく淡い紙の縦罫(蔵書台帳の質感)
        ledger:
          'repeating-linear-gradient(180deg, transparent, transparent 31px, rgba(35,32,27,0.025) 31px, rgba(35,32,27,0.025) 32px)',
      },
    },
  },
  plugins: [],
}

export default config
