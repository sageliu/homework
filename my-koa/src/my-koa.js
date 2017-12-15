const http = require('http')
const url = require('url')
// const URL = url.URL
const Stream = require('stream')

module.exports = class MyKoa {
  constructor() { 
    this.middleware = [];
    this.body = '';
  }
  
  use (fn) {
    this.middleware.push(fn)
  }  

  compose (ctx) {
    let dispatch = (k) => {
      if (k === this.middleware.length) { // 结尾
        return Promise.resolve() // @TODO: 这个没想明白
      }

      let middleFn = this.middleware[k]

      let middleFnList = () => {
       // 包装中间件中的每一个fn
        return middleFn(ctx, () => { // 每一个中间件都传入一个ctx，并传入下一个fn
          return dispatch(k+1) // 包装下一个fn
        })
      }
      // console.log('这句什么时候会执行呢? 没想明白')
      return Promise.resolve(middleFnList())
    }

    return dispatch(0) // 从第一个开始派发 ，处理fn
  }

  listen (port, cb) { 
    const myKoaServer = http.createServer((req, res) => {
      res.statusCode = 404 // 默认给个404

      let ctx = {}
      ctx.req = req;
      ctx.res = res;
      ctx.path = url.parse(req.url).pathname;
      ctx.method = req.method;

      let middlewareCompose = this.compose(ctx)
      middlewareCompose.then(() => {
        let body = ctx.body;

        if (ctx.res.headersSent) { // @TODO: headersSent是什么呢？
          res.end();
        } else {
          res.statusCode = 200
        }
        if (body === undefined) { // body 不能不传
          res.statusCode = 404
        }
        if (body instanceof Stream) { // 处理stream
          return body.pipe(res)
        }

        if (typeof body !== 'string') { //处理json格式
          body = JSON.stringify(body)
        }

        res.end(body || 'not found')
      }).catch(err => {
        console.log(err)
      })
    });
    myKoaServer.listen(port, cb)
  }
}
