import MenuItem from "../UI/MenuItem";
import { getUserStatus } from "./MiddleColumn/ChatInfo";

export default function MessageProfileMenu({ user, canCall, onView, onCall, onMessage }) {
    return <>
        <MenuItem profile={user} title={user?.title ?? user?.firstName + (user?.lastName ? ' ' + user?.lastName : '')} subtitle={getUserStatus(user?.status, user)} onClick={() => { }} />
        <MenuItem icon="person" title="View Profile" onClick={onView} />
        {canCall && <MenuItem icon="call" title="Call" onClick={onCall} />}
        <MenuItem icon="chat" title="Message" onClick={onMessage} />
    </>
}