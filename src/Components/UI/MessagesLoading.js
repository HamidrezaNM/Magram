import { Avatar, Skeleton } from "@mui/material"
import { memo } from "react";

function MessagesLoading() {
    console.log('message loading rerendered')
    var divs = []
    var isOut = false;
    for (let i = 0; i < 20; i++) {
        isOut = Math.round(Math.random() / 1.5) == 0 ? false : true;
        divs.push(
            <div className="item" key={i} style={{ alignSelf: isOut ? 'flex-end' : 'flex-start' }}>
                {isOut ? '' : <Skeleton variant="circular" animation={false}>
                    <Avatar />
                </Skeleton>
                }
                <Skeleton variant="rounded" animation="wave" sx={{ borderRadius: '10px' }} width={Math.round(Math.random() * 100 + 200)} height={Math.round(Math.random() * 100 + 40)} />
            </div>)
    }
    return <>{divs}</>
}

export default memo(MessagesLoading)