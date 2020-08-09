module.exports = {
  extends: ['@nuxtjs/eslint-config-typescript'],
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-empty': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    curly: 'off',
  },
}
