import { memo, useEffect, useRef, useState } from "react"
import Transition from "../App/Transition"

function Tabs({ tabs, children, index, setIndex }) {
    const containerRef = useRef()
    const prevIndex = useRef()
    const scrollDiv = useRef()

    const widthPerTab = scrollDiv.current?.scrollWidth / tabs.props?.children?.length

    useEffect(() => {
        prevIndex.current = index
    }, [])

    useEffect(() => {
        // if (prevIndex.current > index) {
        //     containerRef.current.classList.remove('next')
        //     containerRef.current.classList.add('prev')
        // } else if (prevIndex.current < index) {
        //     containerRef.current.classList.remove('prev')
        //     containerRef.current.classList.add('next')
        // }
        if (scrollDiv.current && prevIndex.current !== index)
            scrollDiv.current.scrollLeft = widthPerTab * index

        prevIndex.current = index
    }, [index])

    const onScroll = () => {
        if (!scrollDiv.current) return

        const currentIndex = Math.round(scrollDiv.current.scrollLeft / widthPerTab)

        if (currentIndex !== index) {
            prevIndex.current = currentIndex
            setIndex(currentIndex)
        }
    }

    return <div className="TabContainer" ref={containerRef}>
        {tabs.props?.children?.length > 0 &&
            <div className="Tabs">
                {tabs}
            </div>}
        <div style={{
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth'
        }} ref={scrollDiv} onScroll={onScroll}>
            <div style={{
                display: 'flex',
                width: tabs.props?.children?.length * 100 + '%'
            }}>
                {children}
            </div>
        </div>
    </div>
}

export default memo(Tabs)