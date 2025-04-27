import { useEffect, useRef, useState } from "react"

export default function Transition({ state, alwaysShow = false, onDeactivate, action, activeAction, eachElement = false, children }) {
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
                setIsActive(false)
            }, 300);
        }
    }, [state])

    useEffect(() => {
        if (isActive) {
            if (activeAction)
                activeAction()
            requestAnimationFrame(() => {
                if (eachElement) {
                    const items = element.current.querySelectorAll('.Transition>*')

                    items.forEach((item) => {
                        item.classList.add('animate', 'showAnim')
                    })
                    requestAnimationFrame(() => {
                        element.current.classList.remove('hidden')
                        items.forEach((item) => {
                            item.classList.remove('animate', 'showAnim')
                        })
                    })
                } else {
                    element.current.firstElementChild.style.transition = 'none'
                    element.current.firstElementChild.classList.add('animate', 'showAnim')
                    requestAnimationFrame(() => {
                        element.current.classList.remove('hidden')
                        requestAnimationFrame(() => {
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

    return <>{(isActive || alwaysShow) && <div className="Transition hidden" ref={element}>
        {children}
    </div>}</>
}