import {staticPlugin} from "@elysiajs/static"
import {swagger} from "@elysiajs/swagger"
import {Elysia, file} from "elysia"
import {ElysiaWS} from "elysia/dist/ws"

interface Connection {
    id: string
    username: string
    x: number
    y: number
    color: {
        h: number
        s: number
        v: number
    }
    ws: ElysiaWS
}

const connections = new Map<string, Connection>()

const app = new Elysia()
    .use(swagger())
    .use(
        staticPlugin({
            noCache: !!process.env.DEBUG,
            indexHTML: true,
        }),
    )
    .get("/", () => file("./public/index.html"))
    .ws("/ws", {
        open(ws) {
            connections.set(ws.id, {
                id: ws.id,
                username: ws.id,
                x: 0,
                y: 0,
                color: {
                    h: 0,
                    s: 0,
                    v: 0,
                },
                ws,
            })
        },
        close(ws) {
            connections.delete(ws.id)
            connections.forEach((connection) => {
                connection.ws.send({
                    type: "disconnect",
                    id: connection.id,
                })
            })
        },
        message(ws, message: any) {
            if (message.type === "update") {
                const connection = connections.get(ws.id)
                if (!connection) return
                connection.username = message.username
                connection.x = message.x
                connection.y = message.y
                connection.color = {
                    h: message.color.h,
                    s: message.color.s,
                    v: message.color.v,
                }
                for (const otherConnection of connections.values()) {
                    if (otherConnection.id === connection.id) continue
                    otherConnection.ws.send({
                        type: "update",
                        id: connection.id,
                        username: connection.username,
                        x: connection.x,
                        y: connection.y,
                        color: connection.color,
                    })
                }
            }
        },
    })
    .listen({
        hostname: process.env.DEBUG ? "localhost" : "0.0.0.0",
        port: process.env.PORT || 3000,
    })

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
