import { memo, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux"
import { handleContextMenu } from "../../Stores/UI";
import Transition from "../Transition";

function ContextMenu({ type }) {

    const contextMenu = useSelector((state) => state.ui.contextMenu)

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
                Array.from(activeElement.current.children).forEach(item => {
                    item.style.top = '0'
                })
            }
            return
        };
        let e = contextMenu.e
        let clientY = contextMenu.top || e.clientY
        let w = contextMenuDiv.current.clientWidth
        let h = contextMenuDiv.current.clientHeight
        let clientX = contextMenu.left || e.clientX

        let originX = 'left'
        let originY = 'top'
        if (clientX > document.body.clientWidth - (w + 10)) {
            clientX -= w
            originX = 'right'
        } else if (contextMenu.width) {
            clientX -= contextMenu.width + 10
        }
        if (clientY > document.body.clientHeight - (h + 70)) {
            clientY = document.body.clientHeight - (h + 70)
            originY = 'bottom'
            if (contextMenu.activeElement) {
                contextMenu.activeElement.style.minHeight = contextMenu.height + 'px'
                Array.from(contextMenu.activeElement.children).forEach(item => {
                    item.style.position = 'relative'
                    item.style.top = `${clientY - contextMenu.top}px`
                })
            }
        }
        requestAnimationFrame(() => {
            contextMenuBG.current?.classList.remove('animate')
            contextMenuDiv.current.classList.remove('animate')
            contextMenuDiv.current.style.height = 0;
            requestAnimationFrame(() => {
                contextMenuDiv.current.style = `height: ${h}px; top: ${clientY}px; left: ${clientX}px; transform-origin: ${originY} !important`
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