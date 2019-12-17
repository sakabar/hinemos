module.exports = {
    "extends": [
        "standard",
        "plugin:react/recommended",
    ],
    "settings": {
        "react": {
            "version": "16.8.6",
        },
    },
    "env": {
        "browser": true,
    },
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true,
        },
    },
    "globals": {
        "DEPLOY_ENV": true,
        "describe": true,
        "it": true,
    },
    "rules": {
        "indent": [
            "error",
            4
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "comma-dangle": [
            "error",
            "always"
        ],
        "yoda": [
            "error",
            "never",
            { "onlyEquality": true },
        ],
        "no-useless-escape": 0, // 正規表現で'\['に反応するのを防ぐ (Bug? PR to eslint)
    }
};
