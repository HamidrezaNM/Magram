import { memo, useEffect, useRef, useState } from "react"
import Transition from "../App/Transition"

function Tabs({ tabs, children, index, setIndex, showOneTab = false, bottom = false }) {
    const containerRef = useRef()
    const prevIndex = useRef()
    const scrollDiv = useRef()

    const tabCount = tabs.props?.children ?
        tabs.props?.children?.filter ?
            tabs.props?.children.filter(item => !!item).length
            : 1
        : 0

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
        const widthPerTab = scrollDiv.current?.scrollWidth / tabCount

        if (scrollDiv.current && prevIndex.current !== index)
            scrollDiv.current.scrollLeft = widthPerTab * index

        prevIndex.current = index
    }, [index])

    const onScroll = () => {
        if (!scrollDiv.current) return

        const widthPerTab = scrollDiv.current?.scrollWidth / tabCount
        const currentIndex = Math.round(scrollDiv.current.scrollLeft / widthPerTab)

        if (currentIndex !== index) {
            prevIndex.current = currentIndex
            setIndex(currentIndex)
        }
    }

    const TabsButtons = ((showOneTab && tabCount > 0) || tabCount > 1) &&
        <Transition state={true}>
            <div className="Tabs">
                {tabs}
            </div>
        </Transition>

    return <div className="TabContainer" ref={containerRef}>
        {!bottom && TabsButtons}
        <div style={{
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            flex: 1
        }} ref={scrollDiv} onScroll={onScroll}>
            <div style={{
                display: 'flex',
                width: (tabCount || 1) * 100 + '%',
                height: '100%'
            }}>
                {children}
            </div>
        </div>
        {bottom && TabsButtons}
    </div>
}

export default memo(Tabs)