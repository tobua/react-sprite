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

export const after = (configuration) => {
  // Remove SVG from file-loader.
  configuration.module.rules[2].test = /\.(png|jpe?g|gif)$/i
}
