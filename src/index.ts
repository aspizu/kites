import {staticPlugin} from "@elysiajs/static"
import {swagger} from "@elysiajs/swagger"
import {Elysia} from "elysia"

const app = new Elysia()
    .use(swagger())
    .use(staticPlugin({indexHTML: true}))
    .listen(3000)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
