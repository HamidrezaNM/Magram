import { Avatar, Skeleton } from "@mui/material"
import { memo } from "react";

function MessagesLoading({ count = 20 }) {
    console.log('message loading rerendered')
    var divs = []
    var isOut = false;
    for (let i = 0; i < count; i++) {
        isOut = Math.round(Math.random() / 1.5) == 0 ? false : true;
        divs.push(
            <div className="item" key={i} style={{ alignSelf: isOut ? 'flex-end' : 'flex-start' }}>
                {isOut ? '' : <div className="Shimmer" style={{ width: 42, height: 42, borderRadius: '50%' }}></div>}
                <div className="Shimmer"
                    style={{
                        borderRadius: '10px',
                        width: Math.round(Math.random() * 100 + 200),
                        height: Math.round(Math.random() * 100 + 40)
                    }} />
            </div>)
    }
    return <>{divs}</>
}

export default memo(MessagesLoading)