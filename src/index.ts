import {staticPlugin} from "@elysiajs/static"
import {swagger} from "@elysiajs/swagger"
import {Elysia, file} from "elysia"

const app = new Elysia()
    .use(swagger())
    .use(
        staticPlugin({
            noCache: !!process.env.DEBUG,
            indexHTML: true,
        }),
    )
    .get("/", () => file("./public/index.html"))
    .listen(3000)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
