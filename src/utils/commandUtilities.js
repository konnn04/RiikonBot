export const displayCurrentTime = () => {
    const date = new Date()
    return [date.getDay(), date.getMonth(), date.getFullYear()].join("/")  + " " + [date.getHours(), date.getMinutes()].join(":")
}