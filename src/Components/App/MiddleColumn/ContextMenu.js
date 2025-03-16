import { memo, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux"
import { handleContextMenu } from "../../Stores/UI";

function ContextMenu() {

    const contextMenu = useSelector((state) => state.ui.value.contextMenu)

    const dispatch = useDispatch()

    const contextMenuDiv = useRef();
    const contextMenuBG = useRef();

    useEffect(() => {
        if (!contextMenu) return;
        let e = contextMenu.e
        let clientX = e.clientX
        let clientY = e.clientY
        let w = contextMenuDiv.current.clientWidth
        let h = contextMenuDiv.current.clientHeight

        let originX = 'left'
        let originY = 'top'
        if (clientX > document.body.clientWidth - (w + 20)) {
            clientX -= w
            originX = 'right'
        }
        if (clientY > document.body.clientHeight - (h + 20)) {
            clientY -= h
            originY = 'bottom'
        }
        requestAnimationFrame(() => {
            contextMenuBG.current?.classList.remove('animate')
            contextMenuDiv.current.classList.remove('animate')
            contextMenuDiv.current.style.height = 0;
            requestAnimationFrame(() => {
                contextMenuDiv.current.style = `height: ${h}px; top: ${clientY}px; left: ${clientX}px;`
            });
        });
    }, [contextMenu]) // ContextMenu

    return contextMenu && (<>
        <div className="bg ContextMenuBG animate" ref={contextMenuBG} onClick={() => dispatch(handleContextMenu())}></div>
        <div className="ContextMenu animate" ref={contextMenuDiv}>
            {contextMenu.items}
        </div>
    </>
    )
}

export default memo(ContextMenu)