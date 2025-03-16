import MenuItem from "../UI/MenuItem";

export default function MessageProfileMenu({ user, canCall, onView, onCall, onMessage }) {
    return <>
        <MenuItem profile={user} title={user.firstName + ' ' + user.lastName} subtitle={'Last seen recently'} onClick={() => { }} />
        <MenuItem icon="person" title="View Profile" onClick={onView} />
        {canCall && <MenuItem icon="call" title="Call" onClick={onCall} />}
        <MenuItem icon="chat" title="Message" onClick={onMessage} />
    </>
}