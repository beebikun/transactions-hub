module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 12
    },
    "rules": {
    },
    "globals": {
        // "var1": "writable",
        "artifacts": "readonly",
        "web3": "readonly",
        "contract": "readonly",
        "it": "readonly",
        "assert": "readonly",
        "beforeEach": "readonly",
        "accounts": "readonly",
    }
};
