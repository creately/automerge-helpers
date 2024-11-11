module.exports = {
    transform: {
      "^.+\\.(ts|tsx)$": "ts-jest"
    },
    extensionsToTreatAsEsm: [".ts"],
    globals: {
      "ts-jest": {
        useESM: true
      }
    }
  };