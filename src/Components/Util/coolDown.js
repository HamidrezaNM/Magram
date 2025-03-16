export function handleCoolDown(action, coolDown = 300) {
    if (window.coolDown) clearTimeout(window.coolDown)
    window.coolDown =
        setTimeout(() => {
            window.coolDown = null
            action()
        }, coolDown);
}