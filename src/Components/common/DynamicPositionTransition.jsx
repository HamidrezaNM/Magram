import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import buildClassName from "../Util/buildClassName";

function DynamicPositionTransition({ state, top = false, left = false, width = false, height = false, children }) {
    const [active, setActive] = useState(false)

    const container = useRef()
    const element = container.current?.children[0]
    const prevRect = useRef()

    useLayoutEffect(() => {
        console.log('element', element)
        if (!element) return

        element.style = ''

        const rect = element.getBoundingClientRect()

        if (prevRect.current) {
            if (left)
                element.style.left = prevRect.current.left + 'px'
            if (top)
                element.style.top = prevRect.current.top + 'px'
            if (width)
                element.style.width = prevRect.current.width + 'px'
            if (height)
                element.style.height = prevRect.current.height + 'px'

            // setActive(true)

            requestAnimationFrame(() => {
                if (left)
                    element.style.left = rect.left + 'px'
                if (top)
                    element.style.top = rect.top + 'px'
                if (width)
                    element.style.width = rect.width + 'px'
                if (height)
                    element.style.height = rect.height + 'px'
            })
        }

        prevRect.current = rect

        setTimeout(() => {
            // setActive(false)
        }, 300);
    }, [state, element])

    // const handleRect = useCallback((node) => {
    //     prevRect.current = node?.getBoundingClientRect();
    // }, []);

    console.log('children', children)

    return <div className={buildClassName("PositionTransition", active && 'active')} ref={container}>
        {children}
    </div>
}

export default memo(DynamicPositionTransition)