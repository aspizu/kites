// @ts-check

import {Kite} from "./kite.js"

const FPS = 30

function getRandomColor() {
    return {
        h: Math.floor(Math.random() * 100),
        s: Math.floor(Math.random() * 100),
        v: Math.floor(Math.random() * 100),
    }
}

function getRandomUsername() {
    return `player${Math.floor(Math.random() * 1000)}`
}

let socket = null

/** @type {Map<string, {lastUpdateTime: number, kite: Kite}>} */
const connections = new Map()

function connect() {
    socket = new WebSocket("/ws")
    socket.addEventListener("open", () => {
        console.log("Connected to websocket server")
    })
    socket.addEventListener("close", () => {
        console.log("Disconnected from websocket server")
        setTimeout(connect, 1000)
    })
    socket.addEventListener("message", (event) => {
        const message = JSON.parse(event.data)
        if (message.type === "update") {
            if (!connections.has(message.id)) {
                connections.set(message.id, {
                    lastUpdateTime: time,
                    kite: new Kite(
                        message.username,
                        message.x,
                        message.y,
                        message.color,
                        false,
                    ),
                })
            }
            const connection = connections.get(message.id)
            if (!connection) return
            connection.lastUpdateTime = time
            connection.kite.username = message.username
            connection.kite.x = message.x
            connection.kite.y = message.y
            connection.kite.color = message.color
        } else if (message.type === "disconnect") {
            connections.delete(message.id)
        }
    })
}

connect()

/** @type {HTMLCanvasElement} */
// @ts-ignore
const canvas = document.getElementById("canvas")
/** @type {CanvasRenderingContext2D} */
// @ts-ignore
const ctx = canvas.getContext("2d")

/** @type {HTMLInputElement} */
// @ts-ignore
const $username = document.getElementById("username")
/** @type {HTMLInputElement} */
// @ts-ignore
const $hue = document.getElementById("hue")
/** @type {HTMLInputElement} */
// @ts-ignore
const $saturation = document.getElementById("saturation")
/** @type {HTMLInputElement} */
// @ts-ignore
const $value = document.getElementById("value")
/** @type {HTMLImageElement} */
// @ts-ignore
const $skybox = document.getElementById("skybox")

$hue.addEventListener("input", () => {
    playerKite.color.h = parseInt($hue.value) || 0
})

$saturation.addEventListener("input", () => {
    playerKite.color.s = parseInt($saturation.value) || 0
})

$value.addEventListener("input", () => {
    playerKite.color.v = parseInt($value.value) || 0
})

$username.addEventListener("input", () => {
    playerKite.username = $username.value || getRandomUsername()
})

$username.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        event.preventDefault()
        event.stopPropagation()
        $username.blur()
    }
})

document.body.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        event.preventDefault()
        $username.focus()
    }
})
const ppx = 1
canvas.width = window.innerWidth / ppx
canvas.height = window.innerHeight / ppx
canvas.style.width = window.innerWidth + "px"
canvas.style.height = window.innerHeight + "px"
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth / ppx
    canvas.height = window.innerHeight / ppx
    canvas.style.width = canvas.width / ppx + "px"
    canvas.style.height = canvas.height / ppx + "px"
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
}, 1000 / FPS)

const playerKite = new Kite(getRandomUsername(), 0, 0, getRandomColor(), true)
$hue.value = playerKite.color.h + ""
$saturation.value = playerKite.color.s + ""
$value.value = playerKite.color.v + ""
$username.value = playerKite.username

function update() {
    if (playerKite.username === "jeb_") {
        playerKite.color.h = (playerKite.color.h + 1) % 100
        $hue.value = playerKite.color.h + ""
    }
    playerKite.x = mouse.x
    playerKite.y = mouse.y
    playerKite.update(time)
    for (const [connectionId, connection] of connections.entries()) {
        if (time - connection.lastUpdateTime > 30) {
            connections.delete(connectionId)
            continue
        }
        connection.kite.update(time)
    }
    if (socket.readyState == WebSocket.OPEN) {
        socket.send(
            JSON.stringify({
                type: "update",
                username: playerKite.username,
                x: playerKite.x,
                y: playerKite.y,
                color: playerKite.color,
            }),
        )
    }
}

ctx.resetTransform = () => {
    Object.getPrototypeOf(ctx).resetTransform.call(ctx)
    ctx.scale(1 / ppx, 1 / ppx)
}
// make canvas context render without antialiasing
ctx.filter =
    "url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxmaWx0ZXIgaWQ9ImZpbHRlciIgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj48ZmVDb21wb25lbnRUcmFuc2Zlcj48ZmVGdW5jUiB0eXBlPSJpZGVudGl0eSIvPjxmZUZ1bmNHIHR5cGU9ImlkZW50aXR5Ii8+PGZlRnVuY0IgdHlwZT0iaWRlbnRpdHkiLz48ZmVGdW5jQSB0eXBlPSJkaXNjcmV0ZSIgdGFibGVWYWx1ZXM9IjAgMSIvPjwvZmVDb21wb25lbnRUcmFuc2Zlcj48L2ZpbHRlcj48L3N2Zz4=#filter)"

function render() {
    ctx.resetTransform()
    const width = canvas.width
    const height = canvas.height * ppx
    const ratio = (($skybox.naturalWidth / width) * height) / $skybox.naturalHeight
    const x = ((time * 1) % (width * ratio)) - width * ratio
    ctx.drawImage($skybox, x, 0, width * ratio, height)
    ctx.drawImage($skybox, x + width * ratio, 0, width * ratio, height)
    playerKite.render(ctx)
    for (const connection of connections.values()) {
        connection.kite.render(ctx)
    }
}
