const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Ajoutez un nouveau 'rule' (règle) pour gérer les fichiers .wasm
  config.module.rules.push({
    test: /\.wasm$/,
    type: 'asset/resource', // Permet de traiter le fichier comme une ressource
    generator: {
      // Ceci garantit que le fichier est copié correctement
      filename: 'static/wasm/[name].[hash:8][ext]', 
    },
  });

  return config;
};