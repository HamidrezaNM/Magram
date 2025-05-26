import { useEffect, useRef, useState } from "react"

export default function Transition({ state, alwaysShow = false, onDeactivate, action, activeAction, eachElement = false, duration = 300, children }) {
    const [isActive, setIsActive] = useState(false)

    const element = useRef()

    useEffect(() => {
        if (state) {
            setIsActive(true)
        } else if (isActive) {
            if (eachElement) {
                element.current.querySelectorAll('.Transition>*').forEach((item) => {
                    item.classList.add('animate', 'hideAnim')
                })
            } else {
                element.current.firstElementChild?.classList?.add('animate', 'hideAnim')
                // element.current.firstElementChild.classList.add('hideAnim')
            }
            if (onDeactivate)
                onDeactivate()
            setTimeout(() => {
                if (!state)
                    setIsActive(false)
            }, duration);
        }
    }, [state])

    useEffect(() => {
        if (isActive) {
            if (activeAction)
                activeAction()
            requestAnimationFrame(() => {
                if (eachElement) {
                    if (!element.current) return

                    const items = element.current.querySelectorAll('.Transition>*')

                    items.forEach((item) => {
                        item.classList.add('animate', 'showAnim')
                    })
                    requestAnimationFrame(() => {
                        if (!element.current) return
                        element.current.classList.remove('hidden')
                        items.forEach((item) => {
                            item.classList.remove('animate', 'showAnim')
                        })
                    })
                } else {
                    if (!element.current || !element.current.firstElementChild) return

                    element.current.firstElementChild.style.transition = 'none'
                    element.current.firstElementChild.classList.add('animate', 'showAnim')
                    requestAnimationFrame(() => {
                        if (!element.current || !element.current.firstElementChild) return
                        element.current.classList.remove('hidden')
                        requestAnimationFrame(() => {
                            if (!element.current || !element.current.firstElementChild) return
                            element.current.firstElementChild.style.transition = ''
                            element.current.firstElementChild.classList.remove('animate', 'showAnim')
                        });
                    })
                }
            })
        } else {
            if (action)
                action()
        }
    }, [isActive])

    return (isActive || alwaysShow) && <div className="Transition hidden" ref={element}>
        {children}
    </div>
}