import { memo, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux"
import { handleContextMenu } from "../../Stores/UI";
import Transition from "../Transition";

function ContextMenu({ type }) {

    const contextMenu = useSelector((state) => state.ui.contextMenu)
    const isiOS = useSelector((state) => state.settings.customTheme.iOSTheme)

    const isMobile = document.body.clientWidth <= 480

    const dispatch = useDispatch()

    const contextMenuDiv = useRef();
    const contextMenuBG = useRef();
    const activeElement = useRef();

    const onChange = () => {
        if (!contextMenu) {
            if (activeElement.current) {
                setTimeout(() => {
                    activeElement.current.classList.remove('selected')
                }, 300);
                activeElement.current.style = ''
            }
            return
        };

        let e = contextMenu.e
        let clientY = e.clientY
        let w = contextMenuDiv.current.clientWidth
        let h = contextMenuDiv.current.clientHeight
        let clientX = e.clientX
        let top;
        let left;
        let width;
        let height;

        if (contextMenu.activeElement && isMobile && isiOS) {
            const rect = contextMenu.activeElement.getBoundingClientRect()

            top = contextMenu.top || rect.top + rect.height
            left = contextMenu.left || rect.left + rect.width
            width = contextMenu.width || rect.width
            height = contextMenu.height || contextMenu.activeElement?.offsetHeight

            clientY = top
            clientX = left
            console.log(top, left, width, height)
        }


        let originX = 'left'
        let originY = 'top'
        if (clientX > document.body.clientWidth - (w + 10)) {
            clientX -= w
            originX = 'right'
        } else if (width) {
            clientX -= width + 10
        }
        if (clientY > document.body.clientHeight - (h + 70)) {
            clientY = document.body.clientHeight - (h + 70)
            originY = 'bottom'
            if (contextMenu.activeElement) {
                contextMenu.activeElement.style.minHeight = height + 'px'
                contextMenu.activeElement.style.transform = `translateY(${clientY - top}px)`
            }
        }
        if (contextMenuDiv.current.querySelector('.Reactions') && isMobile && isiOS) {
            let reactions = contextMenuDiv.current.querySelector('.Reactions')
            console.log('has reactions', height)

            if (clientY - height > 50)
                reactions.style.top = -height - 50 + 'px'
            else {
                reactions.style.backgroundColor = 'var(--theme)'
                reactions.style.top = -clientY + 8 + 'px'
            }
        }
        requestAnimationFrame(() => {
            contextMenuBG.current?.classList.remove('animate')
            contextMenuDiv.current.classList.remove('animate')
            contextMenuDiv.current.style.height = 0;
            requestAnimationFrame(() => {
                contextMenuDiv.current.style = `height: ${h}px; top: ${clientY}px; left: ${clientX}px; transform-origin: ${(isMobile && isiOS) ? 'center' : originX} ${originY} !important`
            });
        });

        if (contextMenu.activeElement) {
            activeElement.current = contextMenu.activeElement
            contextMenu.activeElement.classList.add('selected')
        }
    }

    return <Transition state={!!contextMenu && contextMenu.type === type} eachElement onDeactivate={onChange} activeAction={onChange}>
        <div className="bg ContextMenuBG" ref={contextMenuBG} onClick={() => dispatch(handleContextMenu())}></div>
        <div className="ContextMenu animate" ref={contextMenuDiv}>
            {contextMenu?.items}
        </div>
    </Transition>
}

export default memo(ContextMenu)