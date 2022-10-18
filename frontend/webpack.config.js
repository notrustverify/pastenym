const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const Dotenv = require('dotenv-webpack')

module.exports = {
  entry: {
    main: path.resolve(__dirname, './src/index.js'),
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
      template: path.resolve(__dirname, './src/index.html'), // template file      
      filename: 'index.html', // output file   
     }),
     new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname,'node_modules/@nymproject/nym-client-wasm/*.(js|wasm)'),
          to: '[name][ext]',
        },
      ],
    }),
     new CleanWebpackPlugin(),
     new webpack.HotModuleReplacementPlugin(),
     new Dotenv(),
     
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
    },
  devServer: {
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, './dist'),
    },
    open: false,
    compress: true,
    hot: true,
    port: 8080,
  },
  experiments: { 
    syncWebAssembly: true,
  },
}
