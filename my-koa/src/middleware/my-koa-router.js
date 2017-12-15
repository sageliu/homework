const Route = class {
  constructor(path, method, route) {
    this.path = path
    this.method = method.toUpperCase()
    this.route = (ctx, next) => {
      ctx.params = this.params
      route(ctx, next)
    }
    this.params = {}
  }
  match(reqPath) {
    let paramsObj = {}
    // console.log(this.path)
    let routePathArr = this.path.split('/').filter(item=>item!=='')

    let reqPathArr = reqPath.split('/').filter(item=>item!=='')

    if (routePathArr.length !== reqPathArr.length) {
      return false
    }

    for (let i = 0, len = routePathArr.length; i < len; i++) {
      let route = routePathArr[i]
      // console.log(route)
      let isParam = route.startsWith(':')

      if (isParam) {
        let paramKey = route.slice(1)
        paramsObj[paramKey] = reqPathArr[i]
      } else if (route !== reqPathArr[i]) {
        return false
      }
    }
    this.params = paramsObj
    return true
  }
}

const MyKoaRouter = class {
  constructor() {
    this.routeStack = []
    this.methods = ['get', 'post']
    this.methods.forEach((method) => {
      MyKoaRouter.prototype[method] = (path, route) => {
        this.routeStack.push(new Route(path, method, route))
      }
    })
  }

  all(path, route) {
    this.routeStack.push(new Route(path, 'all', route))
    console.log(this.routeStack)
  }

  getMatchRoutes(reqPath) {
    return this.routeStack.filter((item) => {
      return item.match(reqPath)
    });
  }

  routes() {
    return async (ctx, next) => {
      let routePath = ctx.path

      let matchRoutes = this.getMatchRoutes(routePath)
      if(matchRoutes.length === 0) {
        return next()
      }
      let dispatch = i => {
        if(i === matchRoutes.length) {
          return next()
        }
        let route = matchRoutes[i].route

        let routeWrap = () => {
          return route(ctx, () => {
            return dispatch(i+1)
          })
        }

        return Promise.resolve(routeWrap())
      }
      return dispatch(0)

    }
  }
}

module.exports = MyKoaRouter