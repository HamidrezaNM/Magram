import { createPortal } from "react-dom"
import Transition from "../App/Transition"
import { memo, useEffect, useState } from "react"

function Modal({ open, onClose, title, children }) {
    const [portal, setPortal] = useState(false)

    useEffect(() => {
        console.log('Modal Toggled', open)
        if (open)
            setPortal(true)
    }, [open])

    return portal && createPortal(<Transition state={open} eachElement action={() => setPortal(false)}>
        <div className="bg animate" onClick={onClose}></div>
        <div className="Modal animate">
            <div className="TopBar">
                <div><button onClick={onClose}>Cancel</button></div>
                {title && <div className="Content">
                    <span>{title}</span>
                </div>}
                <div className="Meta"></div>
            </div>
            <div className="Content">
                {children}
            </div>
        </div>
    </Transition>, document.querySelector('.App'))
}

export default memo(Modal)