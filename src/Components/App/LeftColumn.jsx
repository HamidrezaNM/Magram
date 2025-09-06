import { memo, useCallback, useContext, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux";
import Transition from "./Transition";
import CallMinimal from "./Call/CallMinimal";
import Page, { PageHandle } from "./Page";
import { UserContext } from "../Auth/Auth";
import Settings from "./Settings";
import Search from "./Pages/Search";
import NewGroup from "./Pages/NewGroup";
import ChatProfile from "./Pages/ChatProfile";
import UserProfile from "./Pages/UserProfile";
import MenuItem from "../UI/MenuItem";
import DropdownMenu from "../UI/DropdownMenu";
import Menu from "../UI/Menu";
import ChatList, { viewChat } from "./ChatList";
import { Icon } from "./common";
import { handleToggleDarkMode } from "../Stores/Settings";
import MusicPlayer from "./MiddleColumn/MusicPlayer";
import TextTransition from "../common/TextTransition";
import Forward from "./Pages/Forward";
import Stories from "./Stories";
import { generateChatWithPeer } from "../Helpers/chats";

function LeftColumn({ CallRef, CallStream, callState, connectionState }) {

    const callLeftPanelClose = useSelector((state) => state.ui.callLeftPanelClose)
    const pageHeader = useSelector((state) => state.ui.pageHeader)
    const showPage = useSelector((state) => state.ui.showPage)
    const page = useSelector((state) => state.ui.page)
    const topbarTitle = useSelector((state) => state.ui.topbarTitle)
    const callMinimal = useSelector((state) => state.ui.callMinimal)
    const showCall = useSelector((state) => state.ui.showCall)
    const musicPlayer = useSelector((state) => state.ui.musicPlayer)

    const User = useContext(UserContext)

    const dispatch = useDispatch()

    const fabQuickChatMenu = useRef()

    useEffect(() => {
        if (!showPage)
            document.querySelector('.TopBar .Menu .icon').style.animation = '0.3s ease-out 0s 1 normal none running backToMenu'
    }, [showPage]) // Page Transition

    const showNewGroup = useCallback(() => {
        fabQuickChatMenu.current.handleCloseMenu()
        PageHandle(dispatch, 'NewGroup', 'New Group')
    }, [page, showPage])

    const showSettings = useCallback(() => {
        PageHandle(dispatch, 'Settings', 'Settings')
    }, [page, showPage])

    const handleSavedMessages = useCallback(() => {
        viewChat(generateChatWithPeer(User), dispatch)
    }, [User])

    const getPageLayout = useCallback(() => {
        switch (page) {
            case 'Settings':
                return <Settings />
            case 'Search':
                return <Search />
            case 'NewGroup':
                return <NewGroup />
            case 'ChatProfile':
                return <ChatProfile />
            case 'UserProfile':
                return <UserProfile />
            case 'Forward':
                return <Forward />
            default:
                break;
        }
    }, [page])

    return <div className={"LeftColumn" + (callLeftPanelClose ? ' Compact' : '')}>
        <div className="TopBar">
            <div>
                {(pageHeader && showPage) ? <>{pageHeader}</> : <>
                    <Menu icon="menu">
                        <DropdownMenu>
                            <div className="top">
                                <span></span>
                                <Icon name="dark_mode" size={24} onClick={() => dispatch(handleToggleDarkMode())} />
                            </div>
                            <MenuItem icon="person" title="Contacts" onClick={() => { }} />
                            <MenuItem icon="call" title="Calls" onClick={() => { }} />
                            <MenuItem icon="bookmark" title="Saved Messages" onClick={() => handleSavedMessages()} />
                            <MenuItem icon="settings" title="Settings" onClick={showSettings} />
                            <hr />
                            <MenuItem profile={User} title={User.firstName + ' ' + (User.lastName ?? '')} onClick={() => { }} />
                        </DropdownMenu>
                    </Menu>
                    <div className="Title" onDoubleClick={() => window.location.reload()}>
                        <span>
                            <TextTransition text={connectionState === 'connected' ? (topbarTitle ?? 'Magram') : connectionState} />
                        </span>
                    </div>
                    <div className="Meta" onClick={() => PageHandle(dispatch, 'Search', 'Search')}>
                        <Icon name="search" />
                    </div>
                </>}
            </div>
        </div>
        <Transition state={showPage}><Page>{getPageLayout()}</Page></Transition>
        <Stories />
        <div className="Chats scrollable">
            <ChatList />
        </div>
        {(!showPage && !callMinimal && !musicPlayer?.active) && <div className="fab quickChatButton">
            <Menu icon="edit" ref={fabQuickChatMenu}>
                <DropdownMenu>
                    <MenuItem icon="group_add" title="New Group" onClick={showNewGroup} />
                    <MenuItem icon="add" title="New Channel" onClick={() => { }} />
                    <MenuItem icon="person" title="Contacts" onClick={() => { }} />
                    <hr />
                    <MenuItem style={{ height: 46 }} title="QUICK CHAT" onClick={() => { }} />
                </DropdownMenu>
            </Menu>
        </div>}
        <Transition state={callMinimal && showCall}>
            <CallMinimal Call={CallRef} CallStream={CallStream} CallState={callState} />
        </Transition>

        <Transition state={musicPlayer?.active} eachElement>
            <MusicPlayer />
        </Transition>
        {/* <div className="BottomBar">
            <div className="Item">
                <Icon name="person" size={32} />
                <div className="title">Contacts</div>
            </div>
            <div className="Item active">
                <Icon name="forum" size={32} />
                <div className="title">Chats</div>
            </div>
            <div className="Item">
                <Icon name="settings" size={32} />
                <div className="title">Settings</div>
            </div>
        </div> */}
    </div>
}

export default memo(LeftColumn);