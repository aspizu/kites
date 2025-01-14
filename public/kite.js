// @ts-check

import {Thread} from "./thread.js"
import {hsv} from "./utils.js"

/** @type {HTMLImageElement} */
// @ts-ignore
const $cursor = document.getElementById("cursor")

export class Kite {
    /** @type {string} */
    username
    /** @type {{h: number, s: number, v: number}} */
    color
    /** @type {number} */
    x
    /** @type {number} */
    y
    /** @type {number} */
    bx
    /** @type {number} */
    by
    /** @type {Thread} */
    tail1
    /** @type {Thread} */
    tail2
    /** @type {Thread} */
    tail3
    /** @type {boolean} */
    isCurrentPlayer

    /**
     * @param {string} username
     * @param {number} x
     * @param {number} y
     * @param {{h: number, s: number, v: number}} color
     * @param {boolean} isCurrentPlayer
     */
    constructor(username, x, y, color, isCurrentPlayer) {
        this.username = username
        this.color = color
        this.x = x
        this.y = y
        this.bx = this.x
        this.by = this.y
        this.tail1 = new Thread({
            x: 0,
            y: 0,
            length: 10,
            strokeStyle: "",
            lineWidth: 15,
            segmentLength: 15,
            elasticity: 1,
        })
        this.tail2 = new Thread({
            x: 0,
            y: 0,
            length: 10,
            strokeStyle: "",
            lineWidth: 5,
            segmentLength: 20,
            elasticity: 1.5,
        })
        this.tail3 = new Thread({
            x: 0,
            y: 0,
            length: 10,
            strokeStyle: "",
            lineWidth: 4,
            segmentLength: 10,
            elasticity: 0.9,
        })
        this.isCurrentPlayer = isCurrentPlayer
    }

    getAngle() {
        return Math.atan2(this.y - this.by, this.x - this.bx)
    }

    /**
     * @param {number} time
     */
    update(time) {
        this.tail1.strokeStyle = hsv({
            ...this.color,
            h: this.color.h - 5,
            v: this.color.v - 10,
        })
        this.tail2.strokeStyle = hsv({
            ...this.color,
            h: this.color.h - 10,
            v: this.color.v - 20,
        })
        this.tail3.strokeStyle = hsv({
            ...this.color,
            h: this.color.h - 15,
            v: this.color.v - 30,
        })
        const angle = this.getAngle()
        this.bx +=
            (this.x +
                (2 + Math.sin(time / 10) + Math.sin(time / 5) * 0.5) * 15 -
                this.bx) *
            0.1
        this.by += (this.y + 100 - this.by) * 0.1
        this.tail1.x = this.x - Math.cos(angle) * (Math.sqrt(2) * (100 - 15))
        this.tail1.y = this.y - Math.sin(angle) * (Math.sqrt(2) * (100 - 15))
        this.tail2.x = this.tail1.x
        this.tail2.y = this.tail1.y
        this.tail3.x = this.tail1.x
        this.tail3.y = this.tail1.y
        this.tail1.update(time)
        this.tail2.update(time)
        this.tail3.update(time)
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        const angle = this.getAngle()

        // Render the kite tails dynamically
        ;[this.tail1, this.tail2, this.tail3].forEach((tail) => tail.render(ctx))

        // Save context state
        ctx.save()

        // Position and rotate the kite
        ctx.translate(this.x, this.y)
        ctx.rotate(Math.PI * (1 / 2 + 1 / 4) + angle)

        // Add gradient fill for the kite
        const gradient = ctx.createLinearGradient(0, 0, 100, 100)
        gradient.addColorStop(0, hsv({...this.color, v: this.color.v}))
        gradient.addColorStop(
            1,
            hsv({...this.color, h: this.color.h - 10, v: this.color.v / 1.5}),
        )
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 100, 100)

        // Add a semi-transparent border
        ctx.strokeStyle = hsv({...this.color, v: this.color.v / 3})
        ctx.lineWidth = 3
        ctx.strokeRect(0, 0, 100, 100)

        // Add a decorative arc
        ctx.beginPath()
        ctx.arc(100, 100, 100, Math.PI, 1.5 * Math.PI)
        ctx.moveTo(0, 0)
        ctx.lineTo(100, 100)
        ctx.stroke()

        // Restore the context to draw static elements
        ctx.restore()
        ctx.save()

        // Draw username with shadow
        ctx.translate(this.x, this.y)
        ctx.fillStyle = "black"
        ctx.font = "32px BetterPixels"
        ctx.shadowColor = "rgba(0, 0, 0, 0.25)"
        ctx.shadowOffsetX = 1
        ctx.shadowOffsetY = 1
        ctx.fillText(this.username, 10, -10)

        // Draw cursor if not the current player
        if (!this.isCurrentPlayer) {
            ctx.drawImage($cursor, 0, 0)
        }

        // Restore context
        ctx.restore()
    }
}
