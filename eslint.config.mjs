import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const eslintConfig = [
  {
    ignores: ['eslint.config.mjs'],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    settings: {
      react: {
        version: '19.2',
      },
    },
    rules: {
      // These two rules were newly enabled by eslint-plugin-react-hooks@7,
      // which ships with eslint-config-next@16 (Next.js 16 upgrade). They flag
      // ~20 pre-existing, idiomatic sites (e.g. `setMounted(true)` hydration
      // guards, FocusTimer's interdependent timer state, self-referencing retry
      // callbacks) — none are bugs introduced by the upgrade. Disabled here to
      // keep the dependency bump free of behavior-sensitive refactors; tracked
      // for a dedicated follow-up to enforce incrementally. See PR/upgrade notes.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
    },
  },
];

export default eslintConfig;
