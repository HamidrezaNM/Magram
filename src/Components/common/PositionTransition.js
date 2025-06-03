import { memo, useEffect, useRef, useState } from "react";
import buildClassName from "../Util/buildClassName";

function PositionTransition({ state, children }) {
    const [active, setActive] = useState(false)

    const container = useRef()
    const element = container.current?.children[0]
    const prevRect = useRef()

    useEffect(() => {
        if (!element) return

        const rect = element.getBoundingClientRect()

        if (prevRect.current) {
            element.style.left = prevRect.left + 'px'
            element.style.top = prevRect.top + 'px'
            element.style.width = prevRect.width + 'px'
            element.style.height = prevRect.height + 'px'

            setActive(true)

            requestAnimationFrame(() => {
                element.style.left = rect.left + 'px'
                element.style.top = rect.top + 'px'
                element.style.width = rect.width + 'px'
                element.style.height = rect.height + 'px'
            })
        }

        prevRect.current = rect

        setTimeout(() => {
            // setActive(false)
        }, 300);
    }, [state])

    console.log('children', children)

    return <div className={buildClassName("PositionTransition", active && 'active')} ref={container}>
        {children}
    </div>
}

export default memo(PositionTransition)