module.exports = {
  extends: ['@nuxtjs/eslint-config-typescript'],
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    curly: 'off',
    'no-empty': 'off',
    'no-undef': 'off',
  },
}
