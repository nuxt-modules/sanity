module.exports = {
  setupFiles: ['<rootDir>/test/setup.ts'],
  transform: {
    '\\.(js|ts)$': [
      'babel-jest',
      {
        presets: ['@babel/preset-env', '@babel/preset-typescript'],
        plugins: ['@babel/plugin-transform-runtime'],
      },
    ],
  },
  snapshotSerializers: [require.resolve('jest-serializer-vue-tjw')],
  collectCoverage: true,
  collectCoverageFrom: ['src/**', '!templates/**'],
}
