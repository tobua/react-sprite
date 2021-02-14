import SpriteLoaderPlugin from 'svg-sprite-loader/plugin.js'

export default () => ({
  module: {
    rules: [
      {
        test: /\.svg$/,
        loader: 'svg-sprite-loader',
        options: {
          extract: true,
          spriteFilename: (svgPath) => `sprite${svgPath.substr(-4)}`,
        },
      },
    ],
  },
  plugins: [new SpriteLoaderPlugin()],
})
