module.exports = {
  "testEnvironment": "node",
  "preset": "ts-jest",
  "testMatch": [
    "**/__tests__/**/*.ts",
    "**/__tests__/**/*.js"
  ],
  "setupFilesAfterEnv": [
    "./test/setupTests.js"
  ],
  "globals": {
    "ts-jest": {
      "isolatedModules": true
    }
  }
};