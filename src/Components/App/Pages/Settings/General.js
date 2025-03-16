import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { PageClose, PageHeader } from "../../Page";
import { Icon, Switch } from "../../common";
import { UserContext } from "../../../Auth/Auth";

export default function SettingsGeneral() {
    const [isLoaded, setIsLoaded] = useState(false)
    const [privateChat, setPrivateChat] = useState(false)
    const [groups, setGroups] = useState(false)
    const [channels, setChannels] = useState(false)

    const dispatch = useDispatch()

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    return <div className={"SettingsGeneral" + (!isLoaded ? ' fadeThrough' : '')}>
        <PageHeader>
            <div><Icon name="arrow_back" className="backBtn" onClick={() => PageClose(dispatch, true)} /></div>
            <div className="Title"><span>General</span></div>
            <div className="Meta"></div>
        </PageHeader>
        <div className="section Notifications">
            <div className="Items">
                <span className="title">Notifications for chats</span>
                <div className="Item"><span>Private Chats</span>
                    <Switch checked={privateChat} setChecked={setPrivateChat} />
                </div>
                <div className="Item"><span>Groups</span>
                    <Switch checked={groups} setChecked={setGroups} />
                </div>
                <div className="Item"><span>Channels</span>
                    <Switch checked={channels} setChecked={setChannels} />
                </div>
            </div>
        </div>
    </div>
}