module.exports = {
    "extends": "standard",
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
        ]
    }
};
