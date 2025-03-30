import { memo } from "react";

function LoadingButtonBorder() {
    return <>
        <span className="border-top"></span>
        <span className="border-bottom"></span>
    </>
}

export default memo(LoadingButtonBorder)