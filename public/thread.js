// @ts-check

export class Thread {
    /** @type {number} */
    x
    /** @type {number} */
    y
    /** @type {Array<{x: number, y: number}>} */
    points
    /** @type {string} */
    strokeStyle
    /** @type {number} */
    lineWidth
    /** @type {number} */
    segmentLength
    /** @type {number} */
    elasticity

    /**
     * @param {{x: number, y: number, length: number, strokeStyle: string, lineWidth: number, segmentLength: number, elasticity: number}} parameters
     */
    constructor(parameters) {
        this.x = parameters.x
        this.y = parameters.y
        this.points = []
        for (let i = 0; i < parameters.length; i++) {
            this.points.push({
                x: 0,
                y: i * parameters.segmentLength,
            })
        }
        this.strokeStyle = parameters.strokeStyle
        this.lineWidth = parameters.lineWidth
        this.segmentLength = parameters.segmentLength
        this.elasticity = parameters.elasticity
    }

    /**
     * @param {number} time
     */
    update(time) {
        const last = {x: this.x, y: this.y}
        let i = 0
        for (const point of this.points) {
            const fac = this.elasticity / (i + 1)
            point.x +=
                (last.x +
                    (2 + Math.sin(time / 10) + Math.sin(time / 5) * 0.5) * 5 -
                    point.x) *
                fac
            point.y += (last.y + this.segmentLength - point.y) * fac
            last.x = point.x
            last.y = point.y
            i++
        }
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        ctx.resetTransform()
        ctx.beginPath()
        ctx.moveTo(this.x, this.y)
        for (const point of this.points) {
            ctx.lineTo(point.x, point.y)
        }
        ctx.strokeStyle = this.strokeStyle
        ctx.lineWidth = this.lineWidth
        ctx.stroke()
    }
}
