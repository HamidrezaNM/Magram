import { memo, useEffect, useRef, useState } from "react"
import Transition from "../App/Transition"

function Tabs({ tabs, children, index }) {
    const containerRef = useRef()
    const prevIndex = useRef()

    useEffect(() => {
        prevIndex.current = index
    }, [])

    useEffect(() => {
        if (prevIndex.current > index) {
            containerRef.current.classList.remove('next')
            containerRef.current.classList.add('prev')
        } else if (prevIndex.current < index) {
            containerRef.current.classList.remove('prev')
            containerRef.current.classList.add('next')
        }
        prevIndex.current = index
    }, [index])

    return <div className="TabContainer" ref={containerRef}>
        {tabs.props?.children?.length > 0 &&
            <div className="Tabs">
                {tabs}
            </div>}
        {children}
    </div>
}

export default memo(Tabs)