import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UserContext } from "../../Auth/Auth";
import { PageClose, PageHandle, PageHeader, SubPage } from "../Page";
import { BackArrow, Icon, Profile } from "../common";
import DropdownMenu from "../../UI/DropdownMenu";
import MenuItem from "../../UI/MenuItem";
import Transition from "../Transition";
import { ChatContext } from "../ChatContext";
import Menu from "../../UI/Menu";
import { showUserProfile } from "./UserProfile";
import ManageGroup from "./ManageGroup/Manage";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { removeChat, updateChatParticipants } from "../../Stores/Chats";
import { client, socket } from "../../../App";
import { getChatData } from "../Chat";
import FullNameTitle from "../../common/FullNameTitle";
import { setActiveChat } from "../../Stores/UI";
import { getUserStatus } from "../MiddleColumn/ChatInfo";
import { deleteChat, getChatSubtitle, getChatType, getDeleteChatText } from "../../Helpers/chats";
import { Api } from "telegram";
import Tabs from "../../UI/Tabs";
import buildClassName from "../../Util/buildClassName";
import TabContent from "../../UI/TabContent";


export default function ChatProfile() {
    const [isLoaded, setIsLoaded] = useState(false)
    const [openDeleteModal, setOpenDeleteModal] = useState(false)
    const [tabIndex, setTabIndex] = useState(0)

    const dispatch = useDispatch()
    const User = useContext(UserContext)

    const page = useRef()

    const subPage = useSelector((state) => state.ui.subPage)
    const activeChat = useSelector((state) => state.ui.activeChat)
    const fullChat = useSelector((state) => state.ui.activeFullChat)
    const centerTopBar = useSelector((state) => state.ui.customTheme.centerTopBar)
    const iOSTheme = useSelector((state) => state.ui.customTheme.iOSTheme)

    const chatType = getChatType(activeChat.entity)

    useEffect(() => {
        setIsLoaded(true);

        (async () => {
            if (!activeChat.participants && chatType === 'Group') {
                const participants = await client.getParticipants(activeChat)
                console.log(participants)

                dispatch(updateChatParticipants({ id: activeChat.id.value, participants }))
                dispatch(setActiveChat({ ...activeChat, participants }))
            }
        })()
    }, [])

    const onLeaveGroup = () => {
        dispatch(removeChat(activeChat.id.value))
        setOpenDeleteModal(false)
        PageClose(dispatch)
    }

    const leaveGroup = () => {
        (async () => {
            await deleteChat(activeChat, User.id.value)
            onLeaveGroup()
        })()

    }

    const getSubPageLayout = useCallback(() => {
        switch (subPage[0]?.page) {
            case 'Manage':
                return <ManageGroup />
            default:
                break;
        }
    }, [subPage])

    useEffect(() => {
        if (!activeChat) {
            PageClose(dispatch)
        }
    }, [activeChat])

    return <>
        {activeChat && <>
            <div className={"ChatProfile" + (!isLoaded ? ' fadeThrough' : '') + (subPage[0] ? ' pushUp' : '')} ref={page}>
                <PageHeader>
                    <div><BackArrow index={0} onClick={() => PageClose(dispatch)} isiOS={centerTopBar} /></div>
                    <div className="Title"><span></span></div>
                    <div className="Meta">
                        {activeChat?.adminRights && <button onClick={() => { PageHandle(dispatch, 'Manage', 'Manage', true) }}>Manage</button>}
                        <Menu icon="more_vert">
                            <DropdownMenu className="top right withoutTitle">
                                <MenuItem icon="logout" title="Leave Group" className="danger" onClick={() => setOpenDeleteModal(true)} />
                            </DropdownMenu>
                        </Menu>
                    </div>
                </PageHeader>
                <div className="section Info">
                    <div className="User">
                        <Profile entity={activeChat?.entity} name={activeChat?.title} id={activeChat?.entity?.id.value} />
                        <div className="FlexColumn">
                            <div className="name"><FullNameTitle chat={activeChat} isSavedMessages={false} /></div>
                            <div className="subtitle" style={{ fontSize: 14 }}>{getChatSubtitle(fullChat ?? activeChat.entity, getChatType(activeChat.entity))}</div>
                        </div>
                    </div>
                    {iOSTheme && <>
                        <div className="Buttons">
                            <div className="Button">
                                <Icon name="notifications" />
                                <div className="title">
                                    Mute
                                </div>
                            </div>
                            <div className="Button" onClick={() => setOpenDeleteModal(true)}>
                                <Icon name="move_item" />
                                <div className="title">
                                    Leave
                                </div>
                            </div>
                            <div className="Button">
                                <Icon name="more_horiz" />
                                <div className="title">
                                    More
                                </div>
                            </div>
                        </div>
                    </>}
                    <div className="Items">
                        {activeChat.entity?.username && <div className="Item"><Icon name="alternate_email" /><span>{activeChat.entity?.username}</span></div>}
                        {fullChat?.about && <div className="Item preWrap"><Icon name="info" /><span dir="auto">{fullChat?.about}</span></div>}
                    </div>
                </div>
                <div className="section TabSection">
                    <Tabs index={tabIndex} setIndex={setTabIndex} tabs={
                        chatType === 'Group' && <div
                            className={buildClassName("Tab", tabIndex === 0 && 'active')}
                            onClick={() => setTabIndex(0)}>
                            <span>Members</span>
                        </div>
                    }>
                        {chatType === 'Group' && <TabContent state={true}>
                            <div className="Items">
                                <div className="Item" onClick={() => { }}><Icon name="person_add" /><span>Add Members</span></div>
                                {activeChat?.participants && Object.values(activeChat.participants).map((item, index) => (
                                    item.id && <div className="Item" key={item.id?.value} onClick={() => showUserProfile(item, dispatch)}>
                                        <Profile size={44} entity={item} id={item.id?.value} name={item.firstName} />
                                        <div className="UserDetails">
                                            <div className="title">{item.firstName}</div>
                                            <div className="subtitle">{getUserStatus(item.status, item)}</div>
                                        </div>
                                        {item.participant?.adminRights && <div className="meta">{item.participant?.rank ?? 'Admin'}</div>}
                                    </div>
                                ))}
                            </div>
                        </TabContent>}
                    </Tabs>
                </div>
            </div >
            <Transition state={subPage[0]}><SubPage>{getSubPageLayout()}</SubPage></Transition>
            <Dialog
                open={openDeleteModal}
                onClose={() => setOpenDeleteModal(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                PaperProps={{
                    sx: {
                        background: '#0008',
                        backdropFilter: 'blur(25px)',
                        borderRadius: '16px'
                    }
                }}
                sx={{
                    "& > .MuiBackdrop-root": {
                        background: "rgba(0, 0, 0, 0.2)"
                    }
                }}
            >
                <DialogTitle id="alert-dialog-title" className="flex">
                    <Profile entity={activeChat.entity} name={activeChat?.title} id={activeChat?.entity?.id.value} />
                    {getDeleteChatText(activeChat.entity)}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to leave {activeChat?.title}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteModal(false)}>CANCEL</Button>
                    <Button color="error" onClick={leaveGroup}>
                        {getDeleteChatText(activeChat.entity).toUpperCase()}
                    </Button>
                </DialogActions>
            </Dialog>
        </>}
    </>
}