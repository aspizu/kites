import {Kite} from "./kite.js"

function getRandomColor() {
    return {
        r: Math.floor(Math.random() * 256),
        g: Math.floor(Math.random() * 256),
        b: Math.floor(Math.random() * 256),
    }
}

const socket = new WebSocket("ws://localhost:3000/ws")

socket.addEventListener("open", () => {
    console.log("🦊 Connected to the server")
})

socket.addEventListener("close", () => {
    console.log("🦊 Disconnected from the server")
})

const connections = new Map()

socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data)
    if (message.type === "update") {
        if (!connections.has(message.id)) {
            connections.set(message.id, new Kite(message.x, message.y, message.color))
        }
        const connection = connections.get(message.id)
        connection.x = message.x
        connection.y = message.y
        connection.color = message.color
    } else if (message.type === "disconnect") {
        connections.delete(message.id)
    }
})

// @ts-check
/** @type {HTMLCanvasElement} */
// @ts-ignore
const canvas = document.getElementById("canvas")
/** @type {CanvasRenderingContext2D} */
// @ts-ignore
const ctx = canvas.getContext("2d")
canvas.width = window.innerWidth
canvas.height = window.innerHeight

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    render()
})

const mouse = {x: 0, y: 0}
window.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX
    mouse.y = event.clientY
})

let time = 0
setInterval(() => {
    update()
    render()
    time++
}, 30)

const playerKite = new Kite(0, 0, getRandomColor())

function update() {
    playerKite.x = mouse.x
    playerKite.y = mouse.y
    playerKite.update(time)
    for (const connection of connections.values()) {
        connection.update(time)
    }
    socket.send(
        JSON.stringify({
            type: "update",
            x: playerKite.x,
            y: playerKite.y,
            color: playerKite.color,
        }),
    )
}

function render() {
    ctx.resetTransform()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    playerKite.render(ctx)
    for (const connection of connections.values()) {
        connection.render(ctx)
    }
}
