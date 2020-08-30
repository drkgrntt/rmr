import "https://deno.land/x/dotenv/load.ts"
import { Application } from 'https://deno.land/x/oak/mod.ts'
import router from './routes.ts'
import { init } from './database/index.ts'
const port = Deno.env.get('PORT') || 5000

const app = new Application()

await init()

app.use(router.routes())
app.use(router.allowedMethods())

console.log(`Server running on port ${port}`)

await app.listen({ port: +port })
