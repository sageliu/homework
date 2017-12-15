const path = require('path')
const MyKoa = require('./src/my-koa.js')
const app = new MyKoa()
const port = 19999

const Router = require('./src/middleware/my-koa-router.js'); 
const router = new Router()

const server = require('./src/middleware/my-koa-static.js')

router.all('/api/bar', (ctx, next) => {
  ctx.body = {
    route: '/api/bar'
  }
})
router.all('/api/foo/:id', (ctx, next) => {
  // console.log('/api/foo/:id');
  ctx.body = {
    param: {
      id: ctx.params.id
    },
    route: '/api/foo/:id'
  };
});

let routeMiddleware = router.routes();
app.use(routeMiddleware)

app.use(server(path.join(__dirname + '/static')))

app.listen(port, cb)

function cb() {
  console.log(`启动了 ${port}`);
}
