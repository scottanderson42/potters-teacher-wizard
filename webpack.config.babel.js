import path from 'path';

import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import {HotModuleReplacementPlugin} from 'webpack';

const defaultEnv = {
    dev: true,
    production: false,
};

export default (env=defaultEnv) => ({
  entry: [
    ...env.dev ? [
      'react-hot-loader/patch',
      'webpack-dev-server/client?http://localhost:8080',
    ] : [],
    path.join(__dirname, 'src/index.jsx'),
  ],

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },

  plugins: [
    ...env.dev ? [
      // Development plugins
      new HotModuleReplacementPlugin(),
    ] : [
      // Production plugins
      new ExtractTextPlugin('[name].css'),
    ],
    new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.join(__dirname, 'src/index.html'),
    }),
    new ExtractTextPlugin("[name].css"),
  ],

  module: {
    rules: [
      {
        test: /.jsx?$/,
        exclude: /node_modules/,
        include: path.join(__dirname, 'src'),
        loader: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              presets: [
                ['es2015', { modules: false }],
                'react',
              ],
              plugins: ['react-hot-loader/babel'],
            }
          }
        ]
      },
      {
        test: /\.(css|scss|sass)$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader!sass-loader'
        })
      },
      {
        test: /\.mp3$/,
        loader: "file-loader?mimetype=audio/mpeg&outputPath=sounds/&name=[name].[ext]"
      },
      {
        test: /\.png$/,
        loader: "file-loader?mimetype=image/png&outputPath=images/&name=[name].[ext]"
      },
      {
        test: /\.woff(2)?(\?v=\d+\.\d+\.\d+)?$/,
        loader: "file-loader?limit=10000&mimetype=application/font-woff&outputPath=fonts/"
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: "file-loader?limit=10000&mimetype=application/octet-stream&outputPath=fonts/"
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: "file-loader?outputPath=fonts/"
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: "file-loader?limit=10000&mimetype=image/svg+xml&outputPath=images/"
      },
    ]
  },

  devServer: {
    hot: env.dev
  },

});
