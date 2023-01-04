module.exports = {
    'env': {
        'es6': true,
        'node': true
    },
    parser: '@typescript-eslint/parser',
    'extends': [
        'plugin:@typescript-eslint/recommended'
    ],
    'parserOptions': {
        'ecmaVersion': 2020,
        'sourceType': 'module'
    },
    'rules': {
        'indent': [
            'error',
            4
            , { 'SwitchCase': 1 }
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'no-unused-vars': [
            'error',
            { 'argsIgnorePattern': '^_$'  }
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'always'
        ],
        'object-curly-spacing': [
            'error', 'always'
        ],
        'no-trailing-spaces': [
            'error'
        ]
    }
};
