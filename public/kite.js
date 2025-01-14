// @ts-check

import {Thread} from "./thread.js"

/** @type {HTMLImageElement} */
// @ts-ignore
const $cursor = document.getElementById("cursor")

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
     * @param {{r: number, g: number, b: number}} color
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
            strokeStyle: `rgb(${this.color.r / 2}, ${this.color.g}, ${this.color.b})`,
            lineWidth: 15,
            segmentLength: 15,
            elasticity: 1,
        })
        this.tail2 = new Thread({
            x: 0,
            y: 0,
            length: 10,
            strokeStyle: `rgb(${this.color.r}, ${this.color.g / 2}, ${this.color.b})`,
            lineWidth: 5,
            segmentLength: 20,
            elasticity: 1.5,
        })
        this.tail3 = new Thread({
            x: 0,
            y: 0,
            length: 10,
            strokeStyle: `rgb(${this.color.r}, ${this.color.g}, ${this.color.b / 2})`,
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
        const angle = this.getAngle()
        this.bx += (this.x + Math.sin(time / 10) * 10 - this.bx) * 0.1
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
        this.tail1.render(ctx)
        this.tail2.render(ctx)
        this.tail3.render(ctx)
        ctx.resetTransform()
        ctx.translate(this.x, this.y)
        ctx.rotate(Math.PI * (1 / 2 + 1 / 4) + angle)
        ctx.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`
        ctx.fillRect(0, 0, 100, 100)
        ctx.resetTransform()
        ctx.translate(this.x, this.y)
        if (!this.isCurrentPlayer) {
            ctx.drawImage($cursor, 0, 0)
        }
        ctx.fillStyle = "white"
        ctx.font = "bold 12px sans-serif"
        ctx.fillText(this.username, 10, 10)
    }
}
