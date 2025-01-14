//@ts-check

export function hsv({h, s, v}) {
    h = h || 0
    s = s || 0
    v = v || 0
    return `hsl(${h * 3.6}deg, ${s}%, ${v}%)`
}
