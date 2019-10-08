import * as Koa from 'koa'
import * as koaStatic from 'koa-static'
import * as send from 'koa-send'

const app = new Koa()

app.use(koaStatic('public'))
app.use(async (ctx: Koa.Context) => {
  await send(ctx, 'index.html', {root: 'public'})
})

app.listen(3000)

console.log('Server running on port 3000')
