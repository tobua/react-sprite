import { basename } from 'path'
import SpriteLoaderPlugin from 'svg-sprite-loader/plugin.js'

export default () => ({
  module: {
    rules: [
      {
        test: /\.svg$/,
        loader: 'svg-sprite-loader',
        options: {
          extract: true,
          spriteFilename: (svgPath) => {
            // Generate two different sprites, to see if plugin works with several.
            if (basename(svgPath).includes('close')) {
              return 'sprite-close.svg'
            }

            return 'sprite.svg'
          },
        },
      },
    ],
  },
  plugins: [new SpriteLoaderPlugin()],
})

export const after = (configuration) => {
  // Remove SVG from file-loader.
  configuration.module.rules[1].test = /\.(png|jpe?g|gif)$/i
  // Transpile some node_modules for IE 11.
  configuration.module.rules[0].exclude = /node_modules(?!\/exmpl)/
}
