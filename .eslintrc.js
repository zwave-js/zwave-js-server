module.exports = {
    "env": {
        "es2020": true,
        "node": true
    },
    "extends": [
        "standard"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 11,
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
        'no-useless-constructor': 'off',
        'new-cap': 'off'
    }
};
