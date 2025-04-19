import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PageClose, PageHandle, PageHeader, SubPage } from "../../Page";
import { BackArrow, Icon, Switch } from "../../common";
import { UserContext } from "../../../Auth/Auth";
import { Slider } from "@mui/material";
import Message from "../../Message";
import { handleToggleDarkMode } from "../../../Stores/UI";
import SettingsAnimations from "./Animations";
import Transition from "../../Transition";
import buildClassName from "../../../Util/buildClassName";
import SettingsThemes from "./Themes";

export default function SettingsChatSettings() {
    const [isLoaded, setIsLoaded] = useState(false)
    const [fontSize, setFontSize] = useState(16)

    const User = useContext(UserContext)

    const subPage = useSelector((state) => state.ui.subPage)
    const darkMode = useSelector((state) => state.ui.darkMode)
    const centerTopBar = useSelector((state) => state.ui.customTheme.centerTopBar)

    const dispatch = useDispatch()

    const getSubPageLayout = useCallback(() => {
        switch (subPage[1]?.page) {
            case 'Animations':
                return <SettingsAnimations />
            case 'Themes':
                return <SettingsThemes />
            default:
                break;
        }
    }, [subPage])

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    const handleFontSizeChange = (event, newValue) => {
        setFontSize(newValue)
        // dispatch(handleVoiceOutputVolume(newValue))
    }

    return <>
        <div className={buildClassName("SettingsChatSettings", !isLoaded && 'fadeThrough', subPage[1] && 'pushUp')}>
            <PageHeader>
                <div><BackArrow index={1} onClick={() => PageClose(dispatch, true)} isiOS={centerTopBar} /></div>
                <div className="Title"><span>Chat Settings</span></div>
                <div className="Meta"></div>
            </PageHeader>
            <div className="section">
                <span className="title">Message text size</span>
                <div className="Items">
                    <div className="Item">
                        <Slider aria-label="FontSize" min={12} max={30} valueLabelDisplay="off" value={fontSize} onChange={handleFontSizeChange} />
                        <div className="Meta">{fontSize}</div>
                    </div>
                    <div className="MessagesPreview">
                        <div className="Messages">
                            <div className="background purple"></div>
                            <Message key={0} data={{
                                "flags": 0,
                                "out": false,
                                "mentioned": false,
                                "mediaUnread": false,
                                "silent": false,
                                "post": false,
                                "fromScheduled": false,
                                "legacy": false,
                                "editHide": false,
                                "pinned": false,
                                "noforwards": false,
                                "invertMedia": false,
                                "flags2": 0,
                                "offline": false,
                                "videoProcessingPending": false,
                                "id": 1,
                                "fromId": null,
                                "fromBoostsApplied": null,
                                "peerId": {
                                    "userId": User.id.value,
                                    "className": "PeerUser"
                                },
                                "savedPeerId": {
                                    "userId": User.id.value,
                                    "className": "PeerUser"
                                },
                                "fwdFrom": null,
                                "viaBotId": null,
                                "viaBusinessBotId": null,
                                "replyTo": null,
                                "date": 1740077100,
                                "message": "Do you know what this app is?",
                                "media": null,
                                "replyMarkup": null,
                                "entities": null,
                                "views": null,
                                "forwards": null,
                                "replies": null,
                                "editDate": null,
                                "postAuthor": null,
                                "groupedId": null,
                                "reactions": null,
                                "restrictionReason": null,
                                "ttlPeriod": null,
                                "quickReplyShortcutId": null,
                                "effect": null,
                                "factcheck": null,
                                "reportDeliveryUntilDate": null,
                                "className": "Message",
                                _sender: {
                                    "flags": 0,
                                    "self": true,
                                    "contact": false,
                                    "mutualContact": false,
                                    "deleted": false,
                                    "bot": false,
                                    "botChatHistory": false,
                                    "botNochats": false,
                                    "verified": false,
                                    "restricted": false,
                                    "min": false,
                                    "botInlineGeo": false,
                                    "support": false,
                                    "scam": false,
                                    "applyMinPhoto": true,
                                    "fake": false,
                                    "botAttachMenu": false,
                                    "premium": false,
                                    "attachMenuEnabled": false,
                                    "flags2": 16,
                                    "botCanEdit": false,
                                    "closeFriend": false,
                                    "storiesHidden": false,
                                    "storiesUnavailable": true,
                                    "contactRequirePremium": false,
                                    "botBusiness": false,
                                    "botHasMainApp": false,
                                    "id": 0,
                                    "accessHash": "",
                                    "firstName": "Johnson",
                                    "lastName": null,
                                    "username": "",
                                    "phone": "",
                                    "photo": null,
                                    "botInfoVersion": null,
                                    "restrictionReason": null,
                                    "botInlinePlaceholder": null,
                                    "langCode": null,
                                    "emojiStatus": null,
                                    "usernames": null,
                                    "storiesMaxId": null,
                                    "color": null,
                                    "profileColor": null,
                                    "botActiveUsers": null,
                                    "botVerificationIcon": null,
                                    "className": "User"
                                },
                                _senderId: { value: 0 },
                                _chatPeer: { className: 'PeerUser' }
                            }} prevMsgFrom={0} prevMsgDate={1740077100} nextMsgFrom={0} />
                            <Message key={1} seen={true} data={{
                                "flags": 0,
                                "out": true,
                                "mentioned": false,
                                "mediaUnread": false,
                                "silent": false,
                                "post": false,
                                "fromScheduled": false,
                                "legacy": false,
                                "editHide": false,
                                "pinned": false,
                                "noforwards": false,
                                "invertMedia": false,
                                "flags2": 0,
                                "offline": false,
                                "videoProcessingPending": false,
                                "id": 1,
                                "fromId": null,
                                "fromBoostsApplied": null,
                                "peerId": {
                                    "userId": User.id.value,
                                    "className": "PeerUser"
                                },
                                "savedPeerId": {
                                    "userId": User.id.value,
                                    "className": "PeerUser"
                                },
                                "fwdFrom": null,
                                "viaBotId": null,
                                "viaBusinessBotId": null,
                                "replyTo": null,
                                "date": 1740078000,
                                "message": "Yeah, it's Magram",
                                "media": null,
                                "replyMarkup": null,
                                "entities": null,
                                "views": null,
                                "forwards": null,
                                "replies": null,
                                "editDate": null,
                                "postAuthor": null,
                                "groupedId": null,
                                "reactions": null,
                                "restrictionReason": null,
                                "ttlPeriod": null,
                                "quickReplyShortcutId": null,
                                "effect": null,
                                "factcheck": null,
                                "reportDeliveryUntilDate": null,
                                "className": "Message",
                                _sender: {
                                    "flags": 0,
                                    "self": true,
                                    "contact": false,
                                    "mutualContact": false,
                                    "deleted": false,
                                    "bot": false,
                                    "botChatHistory": false,
                                    "botNochats": false,
                                    "verified": false,
                                    "restricted": false,
                                    "min": false,
                                    "botInlineGeo": false,
                                    "support": false,
                                    "scam": false,
                                    "applyMinPhoto": true,
                                    "fake": false,
                                    "botAttachMenu": false,
                                    "premium": false,
                                    "attachMenuEnabled": false,
                                    "flags2": 16,
                                    "botCanEdit": false,
                                    "closeFriend": false,
                                    "storiesHidden": false,
                                    "storiesUnavailable": true,
                                    "contactRequirePremium": false,
                                    "botBusiness": false,
                                    "botHasMainApp": false,
                                    "id": "0",
                                    "accessHash": "",
                                    "firstName": "",
                                    "lastName": null,
                                    "username": "",
                                    "phone": "",
                                    "photo": null,
                                    "botInfoVersion": null,
                                    "restrictionReason": null,
                                    "botInlinePlaceholder": null,
                                    "langCode": null,
                                    "emojiStatus": null,
                                    "usernames": null,
                                    "storiesMaxId": null,
                                    "color": null,
                                    "profileColor": null,
                                    "botActiveUsers": null,
                                    "botVerificationIcon": null,
                                    "className": "User"
                                },
                                _senderId: { value: 0 },
                                _chatPeer: { className: 'PeerUser' }
                            }} prevMsgFrom={0} prevMsgDate={1740078000} nextMsgFrom={0} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="section ColorTheme">
                <span className="title">Color Theme</span>
                <div className="Items">
                    <div className="themes">
                        <div className="background default"></div>
                        <div className="background purple"></div>
                        <div className="background green"></div>
                        <div className="background black"></div>
                    </div>
                    <div className="Item" onClick={() => dispatch(handleToggleDarkMode())}>
                        <Icon name="light_mode" />
                        <span>Switch to {darkMode ? 'Day' : 'Night'} Mode</span>
                    </div>
                    <div className="Item" onClick={() => PageHandle(dispatch, 'Themes', 'Themes', true)}>
                        <Icon name="format_paint" />
                        <span>Browse Themes</span>
                    </div>
                </div>
            </div>
            <div className="section">
                <div className="Items">
                    <div className="Item" onClick={() => PageHandle(dispatch, 'Animations', 'Animations', true)}><Icon name="animation" /><span>Animations</span></div>
                </div>
            </div>
        </div>
        <Transition state={subPage[1]}><SubPage>{getSubPageLayout()}</SubPage></Transition>
    </>
}