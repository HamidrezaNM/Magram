import { memo } from "react";

function Link({ url, allowClick, children }) {
    return <a href={allowClick ? url : undefined}>{children}</a>
}

export default memo(Link)