import { memo, useCallback, useContext, useEffect, useRef, useState } from "react"
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
import buildClassName from "../Util/buildClassName";
import StoryToggler from "./StoryToggler";

function LeftColumn({ CallRef, CallStream, callState, connectionState }) {

    const callLeftPanelClose = useSelector((state) => state.ui.callLeftPanelClose)
    const pageHeader = useSelector((state) => state.ui.pageHeader)
    const showPage = useSelector((state) => state.ui.showPage)
    const page = useSelector((state) => state.ui.page)
    const topbarContent = useSelector((state) => state.ui.topbarContent)
    const topBarFloating = useSelector((state) => state.ui.topBarFloating)
    const callMinimal = useSelector((state) => state.ui.callMinimal)
    const showCall = useSelector((state) => state.ui.showCall)
    const musicPlayer = useSelector((state) => state.ui.musicPlayer)

    const User = useContext(UserContext)

    const dispatch = useDispatch()

    const fabQuickChatMenu = useRef()
    const chatsRef = useRef()
    const topBarTitleRef = useRef()
    const storyToggler = useRef()

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

    useEffect(() => {
        let startY = 0, scrollTop = 0;

        // chatsRef.current.addEventListener("touchstart", (e) => {
        //     startY = e.touches[0].pageY;
        //     scrollTop = chatsRef.current.scrollTop;
        // }, { passive: true });

        // chatsRef.current.addEventListener("touchmove", (e) => {
        //     const currentY = e.touches[0].pageY;
        //     const diff = currentY - startY;

        //     if (chatsRef.current.scrollTop > 0) return


        //     if (scrollTop === 0 && diff > 0) {
        //         chatsRef.current.style.transform = `translate3d(0, ${diff * 0.3}px, 0)`;
        //     }

        //     else if (chatsRef.current.scrollHeight - chatsRef.current.clientHeight - scrollTop <= 0 && diff < 0) {
        //         chatsRef.current.style.transform = `translate3d(0, ${diff * 0.3}px, 0)`;
        //     }
        // });

        // chatsRef.current.addEventListener("touchend", () => {
        //     chatsRef.current.style.transition = "transform 0.3s ease";
        //     chatsRef.current.style.transform = "translate3d(0, 0, 0)";
        //     setTimeout(() => {
        //         chatsRef.current.style.transition = "";
        //     }, 300);
        // });
    }, [])

    return <div className={buildClassName("LeftColumn", callLeftPanelClose && ' Compact', showPage && 'hasPage')}>
        <div className={buildClassName("TopBar", topBarFloating?.floating && 'floating', topBarFloating?.absolute && 'absolute')}>
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
                    <div className="Content" onDoubleClick={() => window.location.reload()}>
                        <StoryToggler ref={storyToggler} />
                        <span ref={topBarTitleRef}>
                            <TextTransition text={connectionState === 'connected' ? (topbarContent?.title ?? 'Magram') : connectionState} />
                        </span>
                    </div>
                    <div className="Meta" onClick={() => PageHandle(dispatch, 'Search', 'Search')}>
                        <Icon name="search" />
                    </div>
                </>}
            </div>
        </div>
        <Transition state={showPage}><Page>{getPageLayout()}</Page></Transition>
        <Stories chatsRef={chatsRef} topBarTitleRef={topBarTitleRef} storyToggler={storyToggler} />
        <div className="Chats scrollable" ref={chatsRef}>
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