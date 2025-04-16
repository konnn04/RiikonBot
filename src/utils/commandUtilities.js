export const displayCurrentTime = () => {
    const date = new Date()
    console.log([date.getHours, date.getMinutes].join(":"))
    return [date.getHours(), date.getMinutes()].join(":") + " " + [date.getDay(), date.getMonth(), date.getFullYear()].join("-")
}