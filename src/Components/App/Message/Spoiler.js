import { memo, useState } from "react";

function Spoiler({ allowClick, children }) {
    const [show, setShow] = useState(false)

    return <span className={"Spoiler" + (show ? ' show' : '')} onClick={() => allowClick && setShow(true)}>
        {children}
        <span className="SpoilerOverlay"></span>
    </span>
}

export default memo(Spoiler)