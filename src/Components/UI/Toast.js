import { memo, useEffect, useState } from "react";
import { Icon } from "../App/common";
import Transition from "../App/Transition";

function Toast({ icon, title }) {
    const [show, setShow] = useState(true)

    useEffect(() => {
        setTimeout(() => {
            setShow(false)
        }, 2000);
    }, [])

    return <Transition state={show}>
        <div className="Toast">
            <Icon name={icon} />
            <span>{title}</span>
        </div>
    </Transition>
}

export default memo(Toast)