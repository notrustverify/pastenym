const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const Dotenv = require('dotenv-webpack')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin')


module.exports = {
  entry: {
    main: path.resolve(__dirname, './src/index.js'),
    app: path.resolve(__dirname, './src/UserInput.js'),
    //worker: path.resolve(__dirname, './src/worker.js'),
    //bootstrap: path.resolve(__dirname, './src/bootstrap.js')
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].bundle.js',
  },
  mode: 'production',
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Pastenym',
      description: "Share text anonymously",
      public_url: "https://pastenym.ch",
      template: path.resolve(__dirname, './src/index.html'), // template file      
      filename: 'index.html', // output file  
    }),
    new FaviconsWebpackPlugin({logo: './public/logo.svg',favicons: {
      appName: 'Pastenym',
      appDescription: 'Share text anonymously',
      developerName: 'No Trust Verify',
      developerURL: null, // prevent retrieving from the nearest package.json
      background: '#FFFFFF',
      theme_color: '#e8e5e1',
      icons: {
        coast: false,
        yandex: false
      },
      inject: true,
    }}),
    new CleanWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new Dotenv(),
    
    new WorkboxPlugin.GenerateSW({
      // these options encourage the ServiceWorkers to get in there fast
      // and not allow any straggling "old" SWs to hang around
      clientsClaim: true,
      skipWaiting: true,
      maximumFileSizeToCacheInBytes: 5000000,
    }),
  ],
  module: {
    rules: [
      // JavaScript 
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      // Images
      {
        test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name]-[hash][ext]'
        }
      },
      {
        test: /\.(png|jpg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name]-[hash][ext]'
        }
      },
      // Fonts and SVGs
      {
        test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
        type: 'asset/inline',
      },
      // CSS, PostCSS, and Sass  
      {
        test: /\.(scss|css)$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
      },
    ],
    // According: https://github.com/bitwiseshiftleft/sjcl/issues/345#issuecomment-345640858
    noParse: [
      /sjcl\.js$/,
    ]
  },
  devServer: {
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, './dist'),
    },
    open: false,
    compress: false,
    port: 8080,
  },
  experiments: {
    syncWebAssembly: true,
    topLevelAwait: true
  },
  performance: {
    maxEntrypointSize: 1012000,
    maxAssetSize: 4212000,
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all"
        }
      }
    }
  }
}
