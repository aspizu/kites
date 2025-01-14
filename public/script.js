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
canvas.width = window.innerWidth
canvas.height = window.innerHeight

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
    playerKite.color.h = parseInt($hue.value)
})

$saturation.addEventListener("input", () => {
    playerKite.color.s = parseInt($saturation.value)
})

$value.addEventListener("input", () => {
    playerKite.color.v = parseInt($value.value)
})

$username.addEventListener("input", () => {
    playerKite.username = $username.value
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

function render() {
    ctx.resetTransform()
    const ratio =
        (($skybox.naturalWidth / canvas.width) * canvas.height) / $skybox.naturalHeight
    const x = ((time * 1) % (canvas.width * ratio)) - canvas.width * ratio
    ctx.drawImage($skybox, x, 0, canvas.width * ratio, canvas.height)
    ctx.drawImage(
        $skybox,
        x + canvas.width * ratio,
        0,
        canvas.width * ratio,
        canvas.height,
    )
    playerKite.render(ctx)
    for (const connection of connections.values()) {
        connection.kite.render(ctx)
    }
}
