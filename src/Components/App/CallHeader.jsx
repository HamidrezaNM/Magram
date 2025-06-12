import { memo } from "react";
import Transition from "./Transition";
import { useDispatch, useSelector } from "react-redux";
import { Icon, Profile } from "./common";
import { handleGroupCallActive } from "../Stores/UI";

function CallHeader() {
    const groupCall = useSelector(state => state.ui.groupCall)

    const dispatch = useDispatch()

    const handleOpen = () => {
        dispatch(handleGroupCallActive(true))
    }

    return <Transition state={!groupCall.active}>
        <div className="header CallHeader" onClick={handleOpen}>
            <div className="meta ParticipantProfiles">
                {groupCall && groupCall.participants?.filter(participant => !participant.left).map((participant) => {
                    return <Profile
                        key={Number(participant?.peer?.userId)}
                        size={28}
                        entity={participant?.user}
                        id={participant?.user?.id?.value}
                        name={participant?.user?.firstName} />
                })}
            </div>
            <div className="title">
                {groupCall?.call?.title ?? 'Voice Chat'}
            </div>
            <div className="actions">
                <div className="mic">
                    <Icon name="mic_off" />
                </div>
            </div>
        </div>
    </Transition>
}

export default memo(CallHeader)