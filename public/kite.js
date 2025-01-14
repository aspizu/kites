// @ts-check

export class Kite {
    /** @type {string} */
    username
    /** @type {{r: number, g: number, b: number}} */
    color
    /** @type {number} */
    x
    /** @type {number} */
    y
    /** @type {number} */
    bx
    /** @type {number} */
    by
    /** @type {Array<{x: number, y: number}>} */
    points

    /**
     * @param {number} x
     * @param {number} y
     * @param {{r: number, g: number, b: number}} color
     */
    constructor(username, x, y, color) {
        this.username = username
        this.color = color
        this.x = x
        this.y = y
        this.bx = this.x
        this.by = this.y
        this.points = []
        for (let i = 0; i < 10; i++) {
            this.points.push({
                x: 0,
                y: i * 15,
            })
        }
    }

    getAngle() {
        return Math.atan2(this.y - this.by, this.x - this.bx)
    }

    /**
     * @param {number} time
     */
    update(time) {
        const angle = this.getAngle()
        this.bx += (this.x + Math.sin(time / 10) * 10 - this.bx) * 0.1
        this.by += (this.y + 100 - this.by) * 0.1
        const last = {
            x: this.x - Math.cos(angle) * (Math.sqrt(2) * 100),
            y: this.y - Math.sin(angle) * (Math.sqrt(2) * 100) - 15,
        }
        let i = 0
        for (const point of this.points) {
            const fac = 1 / (i + 1)
            point.x += (last.x - point.x) * fac
            point.y += (last.y + 15 - point.y) * fac
            last.x = point.x
            last.y = point.y + 10
            i++
        }
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        const angle = this.getAngle()
        ctx.resetTransform()
        ctx.beginPath()
        ctx.moveTo((this.x + this.bx) / 2, (this.y + this.by) / 2)
        for (const point of this.points) {
            ctx.lineTo(point.x, point.y)
        }
        ctx.strokeStyle = `rgb(${this.color.r * 0.8}, ${
            this.color.g / 2
        }, ${this.color.b * 0.8})`
        ctx.lineWidth = 15
        ctx.stroke()
        ctx.resetTransform()
        ctx.translate(this.x, this.y)
        ctx.rotate(Math.PI * (1 / 2 + 1 / 4) + angle)
        ctx.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`
        ctx.fillRect(0, 0, 100, 100)
        ctx.resetTransform()
        ctx.translate(this.x, this.y)
        ctx.fillStyle = "black"
        ctx.font = "bold 12px sans-serif"
        ctx.fillText(this.username, 10, 10)
    }
}
