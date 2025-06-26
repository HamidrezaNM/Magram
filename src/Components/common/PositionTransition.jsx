import { memo, useEffect, useRef, useState } from "react";
import buildClassName from "../Util/buildClassName";
import { useSelector } from "react-redux";
import { handlePositionTransitionEnd } from "../Stores/UI";

function PositionTransition() {
    const elements = useSelector(state => state.ui.positionTransition)

    return elements.map(item => <PositionTransitionElement from={item.from} to={item.to} elementt={item.element} />)
}

function PositionTransitionElement({ from, to, elementt }) {
    const [active, setActive] = useState(false)

    const container = useRef()
    const element = container.current?.children[0]

    useEffect(() => {
        if (!element) return

        if (from) {
            element.style.left = from.left + 'px'
            element.style.top = from.top + 'px'
            element.style.width = from.width + 'px'
            element.style.height = from.height + 'px'

            // setActive(true)

            requestAnimationFrame(() => {
                element.style.left = to.left + 'px'
                element.style.top = to.top + 'px'
                element.style.width = to.width + 'px'
                element.style.height = to.height + 'px'
            })
        }

        setTimeout(() => {
            // setActive(false)
        }, 300);
    }, [from, to])

    console.log('children', elementt)

    return <div className={buildClassName("PositionTransition", active && 'active')} ref={container}>
        {elementt}
    </div>
}

export function handlePositionTransitionElement(id, from, to, element, dispatch, onEnd) {
    if (from) {
        element.style.transition = 'all .3s ease'
        element.style.position = 'fixed'
        element.style.left = from.left + 'px'
        element.style.top = from.top + 'px'
        element.style.width = from.width + 'px'
        element.style.height = from.height + 'px'

        // setActive(true)

        requestAnimationFrame(() => {
            element.style.left = to.left + 'px'
            element.style.top = to.top + 'px'
            element.style.width = to.width + 'px'
            element.style.height = to.height + 'px'
            setTimeout(() => {
                element.style.position = ''
                dispatch(handlePositionTransitionEnd(id))
                onEnd()
            }, 300);
        })
    }
}

export default memo(PositionTransition)