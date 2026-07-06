import { dirname } from 'path'
import { fileURLToPath } from 'url'
import tseslint from 'typescript-eslint'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const eslintConfig = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      '*.config.js',
      '*.config.mjs',
    ],
  },
  ...nextCoreWebVitals,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // ── 하네스 핵심: 에러로 강제 (경고 아님) ──────────────────
      'no-console': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',

      // ── 타입 안전 ──────────────────────────────────────────────
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',

      // ── React / Next.js 규칙 ───────────────────────────────────
      'react/prop-types': 'off', // TypeScript Props interface로 대체
      'react-hooks/exhaustive-deps': 'error',
      'import/no-anonymous-default-export': 'error',
    },
  },
  {
    // ── alexview CLAUDE.md 규칙 강제 (React 컴포넌트 파일에만 적용) ──
    // lib/, hooks/, app/api/**(라우트 핸들러)는 fetch·process.env 직접 사용이 허용된다.
    files: ['app/**/*.tsx', 'components/**/*.tsx'],
    rules: {
      // 컴포넌트에서 fetch 직접 호출 금지 → lib/ 경유 강제
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message:
            '컴포넌트에서 fetch 직접 호출 금지. lib/ 아래 API 클라이언트 함수를 사용하세요.',
        },
      ],

      // process.env 날것 노출 금지 (lib/ 래핑 강제)
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "MemberExpression[object.name='process'][property.name='env']",
          message:
            'process.env를 컴포넌트에 직접 노출 금지. lib/ 에서 래핑하세요.',
        },
      ],
    },
  },
]

export default eslintConfig
