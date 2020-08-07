module.exports = {
  env: {
    browser: true,
  },
  extends: ['@siroc'],
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-empty': 'off',
  },
}
