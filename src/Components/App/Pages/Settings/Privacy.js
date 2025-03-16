import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { PageClose, PageHeader } from "../../Page";
import { Icon, Switch } from "../../common";
import { UserContext } from "../../../Auth/Auth";

export default function SettingsPrivacy() {
    const [isLoaded, setIsLoaded] = useState(false)

    const dispatch = useDispatch()
    const User = useContext(UserContext)

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    return <div className={"SettingsPrivacy" + (!isLoaded ? ' fadeThrough' : '')}>
        <PageHeader>
            <div><Icon name="arrow_back" className="backBtn" onClick={() => PageClose(dispatch, true)} /></div>
            <div className="Title"><span>Privacy and Security</span></div>
            <div className="Meta"></div>
        </PageHeader>
        <div className="section Notifications">
            <div className="Items">
                <span className="title">Privacy</span>
                <div className="Item"><span>Phone Number</span></div>
                <div className="Item"><span>Last seen & Online</span></div>
                <div className="Item"><span>Profile Photos</span></div>
            </div>
        </div>
    </div>
}