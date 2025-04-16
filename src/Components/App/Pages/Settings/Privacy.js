import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PageClose, PageHeader } from "../../Page";
import { BackArrow, Icon, Switch } from "../../common";
import { UserContext } from "../../../Auth/Auth";

export default function SettingsPrivacy() {
    const [isLoaded, setIsLoaded] = useState(false)

    const centerTopBar = useSelector((state) => state.ui.customTheme.centerTopBar)

    const dispatch = useDispatch()
    const User = useContext(UserContext)

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    return <div className={"SettingsPrivacy" + (!isLoaded ? ' fadeThrough' : '')}>
        <PageHeader>
            <div><BackArrow index={1} onClick={() => PageClose(dispatch, true)} isiOS={centerTopBar} /></div>
            <div className="Title"><span>Privacy and Security</span></div>
            <div className="Meta"></div>
        </PageHeader>
        <div className="section Notifications">
            <span className="title">Privacy</span>
            <div className="Items">
                <div className="Item"><span>Phone Number</span></div>
                <div className="Item"><span>Last seen & Online</span></div>
                <div className="Item"><span>Profile Photos</span></div>
            </div>
        </div>
    </div>
}