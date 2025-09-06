import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PageClose, PageHandle, PageHeader, SubPage } from "../../Page";
import { BackArrow, Profile } from "../../common";
import Transition from "../../Transition";
import AdminRights from "./AdminRights";
import FullNameTitle from "../../../common/FullNameTitle";
import { getUserStatus } from "../../MiddleColumn/ChatInfo";
import buildClassName from "../../../Util/buildClassName";

export default function Members() {
    const dispatch = useDispatch()

    const subPage = useSelector((state) => state.ui.subPage)
    const activeChat = useSelector((state) => state.ui.activeChat)
    const centerTopBar = useSelector((state) => state.settings.customTheme.centerTopBar)

    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    const getSubPageLayout = useCallback(() => {
        switch (subPage[3]?.page ?? subPage[2]?.page) {
            case 'AdminRights':
                return <AdminRights />
            default:
                break;
        }
    }, [subPage])

    const showAdminRights = (user) => {
        PageHandle(dispatch, 'AdminRights', 'Admin Rights', true, user)
    }

    return <>
        <div className={buildClassName("Members",
            !isLoaded && 'fadeThrough',
            (subPage[3] ?? subPage[2]?.page === 'AdminRights') && 'pushUp')}>
            <PageHeader key={subPage[3] + subPage[2]}>
                <div><BackArrow index={3} onClick={() => PageClose(dispatch, true)} isiOS={centerTopBar} /></div>
                <div className="Content"><span>Members</span></div>
                <div className="Meta"></div>
            </PageHeader>
            <div className="section">
                <div className="Items">
                    {activeChat?.participants && Object.values(activeChat.participants).map((item) => (
                        item.id && <div className="Item" key={item.id?.value} onClick={() => showAdminRights(item)}>
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
        <Transition state={subPage[3] ?? subPage[2]?.page === 'AdminRights'}><SubPage>{getSubPageLayout()}</SubPage></Transition>
    </>
}