module.exports = {
  'extends': 'airbnb-base',
  "parserOptions": {
    "ecmaFeatures": {
      "globalReturn": true,
      "generators": true,
      "objectLiteralDuplicateProperties": false,
      "experimentalObjectRestSpread": true
    },
    "ecmaVersion": 2017,
    "sourceType": "script"
  },
  'env': {
    'node': true,
    'browser': false,
  },
  'rules': {
    'strict': ['error', 'global'],
    'no-console': ['off'],
    'quote-props': ['warn', 'consistent-as-needed'],
  },
};
