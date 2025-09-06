import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AuthContext, UserContext } from "../../../Auth/Auth";
import { PageClose, PageHeader, SubPage } from "../../Page";
import { Icon, Profile } from "../../common";
import Transition from "../../Transition";

export default function AddMembers() {
    const dispatch = useDispatch()
    const User = useContext(UserContext)
    const Auth = useContext(AuthContext)

    const subPage = useSelector((state) => state.ui.subPage)
    const activeChat = useSelector((state) => state.ui.activeChat)

    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    return <>
        <div className={"AddMembers" + (!isLoaded ? ' fadeThrough' : '')}>
            <PageHeader key={subPage[2]}>
                <div><Icon name="arrow_back" className="backBtn" onClick={() => PageClose(dispatch, true)} /></div>
                <div className="Content"><span>Add Members</span></div>
                <div className="Meta"></div>
            </PageHeader>
            <div className="section">
                <div className="Items">
                    {Object.values(activeChat.members).filter(member => { return member._id !== User._id }).map((item) => (
                        <div className="Item" onClick={() => showAdminRights(item, dispatch)}>
                            <Profile size={44} name={item.firstname} id={item._id} />
                            <div className="UserDetails">
                                <div className="title">{item.firstname}</div>
                                <div className="subtitle">Online</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        <Transition state={subPage[3]}><SubPage>{getSubPageLayout()}</SubPage></Transition>
    </>
}