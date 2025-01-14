//@ts-check

export function hsv({h, s, v}) {
    return `hsl(${h * 3.6}deg, ${s}%, ${v}%)`
}
