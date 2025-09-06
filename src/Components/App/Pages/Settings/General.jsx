import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PageClose, PageHeader } from "../../Page";
import { BackArrow, Icon, Switch } from "../../common";
import { UserContext } from "../../../Auth/Auth";

export default function SettingsGeneral() {
    const [isLoaded, setIsLoaded] = useState(false)
    const [privateChat, setPrivateChat] = useState(false)
    const [groups, setGroups] = useState(false)
    const [channels, setChannels] = useState(false)

    const centerTopBar = useSelector((state) => state.settings.customTheme.centerTopBar)

    const dispatch = useDispatch()

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    return <div className={"SettingsGeneral" + (!isLoaded ? ' fadeThrough' : '')}>
        <PageHeader>
            <div><BackArrow index={1} onClick={() => PageClose(dispatch, true)} isiOS={centerTopBar} /></div>
            <div className="Content"><span>General</span></div>
            <div className="Meta"></div>
        </PageHeader>
        <div className="section Notifications">
            <span className="title">Notifications for chats</span>
            <div className="Items">
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