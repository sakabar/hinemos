module.exports = {
    "extends": [
        "standard",
        "plugin:react/recommended",
    ],
    "settings": {
        "react": {
            "version": "16.5.0",
        },
    },
    "env": {
        "browser": true,
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
