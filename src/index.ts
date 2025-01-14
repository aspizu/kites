import {staticPlugin} from "@elysiajs/static"
import {swagger} from "@elysiajs/swagger"
import {Elysia, file} from "elysia"
import {ElysiaWS} from "elysia/dist/ws"

interface Connection {
    id: string
    x: number
    y: number
    color: {
        r: number
        g: number
        b: number
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
                x: 0,
                y: 0,
                color: {
                    r: 0,
                    g: 0,
                    b: 0,
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
                connection.x = message.x
                connection.y = message.y
                connection.color = message.color
                for (const otherConnection of connections.values()) {
                    if (otherConnection.id === connection.id) continue
                    otherConnection.ws.send({
                        type: "update",
                        id: connection.id,
                        x: connection.x,
                        y: connection.y,
                        color: connection.color,
                    })
                }
            }
        },
    })
    .listen({hostname: "0.0.0.0", port: process.env.PORT || 3000})

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
