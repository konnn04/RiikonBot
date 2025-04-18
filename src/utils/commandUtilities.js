export const displayCurrentTime = () => {
    const date = new Date()
    return [date.getDate(), date.getMonth(), date.getFullYear()].join("/")  + " " + [date.getHours(), date.getMinutes()].join(":")
}