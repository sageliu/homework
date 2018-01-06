const path = require('path'); //专门解决路径问题的
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry: './src/main.js', //入口文件
    output: { //出口这里写的是：1.打包到哪个路径下，2.打包文件的名字
        path: path.resolve('dist'), //输出的路径必须是绝对路径
        filename: 'bundle.js' //打包后的文件名，一般都叫这个，还有的叫build.js的
    },
    //  给js文件配一个翻译官，翻译将es6 -> es5 / es7 ->es5
    //  babel将代码转译， 两个包 babel-core  核心包  babel-loader
    module: {
        rules: [{
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/
            },
            //test:规则，use：使用哪个转译器，exclude:排除文件目录,匹配规则
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
                exclude: /node_modules/
            },
            //use中写数组的时候，规则是从右往左写，先执行的放在后面
            {
                test: /\.less$/,
                use: ['style-loader', 'css-loader', 'less-loader']
            }, {
                test: /\.(jpg|png|gif|svg)$/,
                use: ['url-loader?limit=8192']
            }, //url-loader会自动去引用file-loader

        ]
    },
    plugins: [ //配置的是webpack插件
        new HtmlWebpackPlugin({
            template: './src/index.html', //会自动将打包后的内容，自动放到dist/index.html中
        })
    ],
};



const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
let isDev = process.env.NODE_ENV === 'develop'; // 是否是开发环境
let localhost=!isDev?'localhost':'192.168.0.102';
module.exports = {
  entry: {
    vendor: ['babel-polyfill', 'react', 'react-dom', 'redux', 'react-redux', 'react-router-dom'],
    main: './main/main.js'
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    // publicPath: '/',
    publicPath: isDev ? 'http://localhost:13333/' : '/',
    filename: 'js/[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(jsx|js)$/,
        exclude: path.resolve(__dirname, '../node_modules/'),
        use: 'babel-loader'
      },
      {
        test: /\.(less|css)$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'less-loader']
      },
      {test: /.(jpg|png|gif|svg)$/, use: ['url-loader?limit=8192&name=./[name].[ext]']},/*解析图片*/
      {
        test:/\.(eot|svg|woff|woff2|ttf)$/,//如果是bootstrap中的这五种字体的话
        loader:'url-loader'
      }
    ]
  },
  resolve: {
    alias: {
      '@': path.join(__dirname)
    },
    extensions: ['.js', '.jsx']
  },
  devtool: isDev ? 'cheap-module-eval-source-map' : '',
  context: __dirname,
  devServer: {
    hot: true,
    port: 13333,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    proxy: {
      '/api': {
        target: 'http://localhost:19999/api',
        pathRewrite: {"^/api" : ""}
      },
      '/login': {
        target: 'http://localhost:19999/login',
        pathRewrite: {"^/login" : ""}
      }
    }
  },
  plugins: [
    new OpenBrowserPlugin({ url: `http://${localhost}:13333/` }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV':
        isDev ? JSON.stringify('develop') : JSON.stringify('production')
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'js/[name].bundle.js',
      minChunks: Infinity
    }),
    new HtmlWebpackPlugin({
      template: './template/index.html',
      filename: 'index.html',
      chunks: ['vendor', 'main'],
      inject: true,
      miniify:{
        collapseWhitespace:true
      }
    })
  ]
};
