import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PageClose, PageHandle, PageHeader, SubPage } from "../../Page";
import { BackArrow, Icon, Profile } from "../../common";
import Transition from "../../Transition";
import AdminRights from "./AdminRights";
import Members from "./Members";
import { getUserStatus } from "../../MiddleColumn/ChatInfo";
import FullNameTitle from "../../../common/FullNameTitle";

export default function Administrators() {
    const dispatch = useDispatch()

    const subPage = useSelector((state) => state.ui.subPage)
    const activeChat = useSelector((state) => state.ui.activeChat)
    const centerTopBar = useSelector((state) => state.settings.customTheme.centerTopBar)

    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    const getSubPageLayout = useCallback(() => {
        switch (subPage[2]?.page) {
            case 'AdminRights':
                return <AdminRights />
            case 'Members':
                return <Members />
            default:
                break;
        }
    }, [subPage])

    const showAdminRights = (user) => {
        PageHandle(dispatch, 'AdminRights', 'Admin Rights', true, user)
    }

    const showMembers = () => {
        PageHandle(dispatch, 'Members', 'Members', true)
    }

    return <>
        <div className={"Administrators" + (!isLoaded ? ' fadeThrough' : '') + (subPage[2] ? ' pushUp' : '')}>
            <PageHeader key={subPage[2]}>
                <div><BackArrow index={3} onClick={() => PageClose(dispatch, true)} isiOS={centerTopBar} /></div>
                <div className="Title"><span>Administrators</span></div>
                <div className="Meta"></div>
            </PageHeader>
            <div className="section">
                <div className="Items Members">
                    <div className="Item" onClick={showMembers}><Icon name="add_moderator" /><span>Add Admin</span></div>
                    {activeChat?.participants &&
                        Object.values(activeChat.participants)
                            .filter(item => item.participant?.adminRights)
                            .map((item) => (
                                item.id && <div
                                    className="Item"
                                    key={item.id?.value}
                                    onClick={() => showAdminRights(item)}>
                                    <Profile size={44} entity={item} id={item.id?.value} name={item.firstName} />
                                    <div className="UserDetails">
                                        <div className="title"><FullNameTitle chat={item} /></div>
                                        <div className="subtitle">{getUserStatus(item.status, item)}</div>
                                    </div>
                                    {item.participant?.adminRights &&
                                        <div className="meta">
                                            {item.participant?.rank ??
                                                (item.participant?.className === 'ChannelParticipantCreator' ?
                                                    'Owner' : 'Admin')}
                                        </div>}
                                </div>
                            ))}
                </div>
            </div>
        </div>
        <Transition state={subPage[2]}><SubPage>{getSubPageLayout()}</SubPage></Transition>
    </>
}