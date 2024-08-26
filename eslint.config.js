module.exports = [
    {
      files: ['**/*.{js,jsx}'],
      languageOptions: {
        parserOptions: {
          ecmaVersion: 2020,
          sourceType: 'module',
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      extends: [
        'react-app',
        // otros extends si los tienes
      ],
      // otras configuraciones de ESLint
      plugins: {
        react: {
          settings: {
            react: {
              version: 'detect',
            },
          },
        },
      },
      rules: {
        'react/jsx-uses-react': 'off',
        'react/react-in-jsx-scope': 'off',
      },
    },
  ];
  