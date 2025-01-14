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
setInterval(() => {
    update()
    render()
}, 16.67)
const kite = {bx: 0, by: 0, points: Array(10).fill({x: 0, y: 0})}
function update() {
    kite.bx += (mouse.x - kite.bx) * 0.1
    kite.by += (mouse.y + 100 - kite.by) * 0.1
    let i = 0
    for (const point of kite.points) {
        const fac = 0.5 / (i + 1)
        point.x += (0 - point.x) * fac
        point.y += (0 + 100 + i * 10 - point.y) * fac
        i++
    }
}
function render() {
    ctx.resetTransform()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.translate(mouse.x, mouse.y)
    const angle = Math.atan2(mouse.y - kite.by, mouse.x - kite.bx)
    ctx.rotate(Math.PI * (1 / 2 + 1 / 4) + angle)
    ctx.fillStyle = "green"
    ctx.fillRect(0, 0, 100, 100)
    ctx.resetTransform()
    ctx.translate(
        mouse.x - Math.cos(angle) * (Math.sqrt(2) * 100),
        mouse.y - Math.sin(angle) * (Math.sqrt(2) * 100),
    )
    ctx.beginPath()
    ctx.moveTo(0, 0)
    for (const point of kite.points) {
        ctx.lineTo(point.x, point.y)
    }
    ctx.stroke()
}
