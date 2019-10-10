import Koa from 'koa'
import koaStatic from 'koa-static'
import send from 'koa-send'

const app = new Koa()

app.use(koaStatic(`${__dirname}/public`))
app.use(async (ctx: Koa.Context) => {
  await send(ctx, 'index.html', {root: `${__dirname}/public`})
})

app.listen(3000)

console.log('Server running on port 3000')
