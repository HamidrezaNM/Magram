import { memo, useCallback, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PageClose, PageHeader } from "../../Page";
import { BackArrow, Icon, Switch } from "../../common";
import { AuthContext, UserContext } from "../../../Auth/Auth";
import { DetectDevice, GetDeviceData } from "../../../Auth/Verify";
import { client } from "../../../../App";
import DropdownMenu from "../../../UI/DropdownMenu";
import MenuItem from "../../../UI/MenuItem";
import Menu from "../../../UI/Menu";
import { Api } from "telegram";

function SettingsDevices() {
    const [isLoaded, setIsLoaded] = useState(false)
    const [currentSession, setCurrentSession] = useState()
    const [sessions, setSessions] = useState()

    const centerTopBar = useSelector((state) => state.settings.customTheme.centerTopBar)

    const dispatch = useDispatch()

    const terminateSession = async (sessionId) => {
        await client.invoke(new Api.account.ResetAuthorization({ hash: sessionId }))
        var data = sessions.filter(e => e.hash?.value !== sessionId)
        setSessions(data)
    }


    const GetOS = () => {
        const userAgent = window.navigator.userAgent,
            platform = window.navigator?.userAgentData?.platform || window.navigator.platform,
            macosPlatforms = ['macOS', 'Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
            windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
            iosPlatforms = ['iPhone', 'iPad', 'iPod'];
        let os = null;

        if (macosPlatforms.indexOf(platform) !== -1) {
            os = 'Mac OS';
        } else if (iosPlatforms.indexOf(platform) !== -1) {
            os = 'iOS';
        } else if (windowsPlatforms.indexOf(platform) !== -1) {
            os = 'Windows';
        } else if (/Android/.test(userAgent)) {
            os = 'Android';
        } else if (/Linux/.test(platform)) {
            os = 'Linux';
        }

        return os;
    }

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    useEffect(() => {
        (async () => {
            const getAuthorizations = await client.invoke(new Api.account.GetAuthorizations({}))
            const authorizations = getAuthorizations.authorizations

            const currentSession = authorizations.find(item => item.current === true)
            const otherSessions = authorizations.filter(item => item.current === false)
            setCurrentSession(currentSession)
            setSessions(otherSessions)
        })()
    }, [])

    return <div className={"SettingsDevices" + (!isLoaded ? ' fadeThrough' : '')}>
        <PageHeader>
            <div><BackArrow index={1} onClick={() => PageClose(dispatch, true)} isiOS={centerTopBar} /></div>
            <div className="Title"><span>Devices</span></div>
            <div className="Meta"></div>
        </PageHeader>
        <div className="section ThisDevice">
            <span className="title">This device</span>
            <div className="Items">
                <div className="Item Device">
                    <Icon name={currentSession?.platform === 'Android' ? "android" : 'laptop_windows'} />
                    <div className="FlexColumn">
                        <span className="title">{currentSession?.deviceModel}</span>
                        <span className="subtitle">{currentSession?.appName + ' ' + currentSession?.appVersion}</span>
                    </div>
                    <span className="Meta">{currentSession?.country}</span>
                </div>
                <div className="Item danger"><Icon name="front_hand" /><span>Terminate All Other Sessions</span></div>
            </div>
        </div >
        <div className="section ActiveSession">
            <span className="title">Active sessions</span>
            <div className="Items">
                {sessions && sessions.map((item) => (
                    <Menu key={item.hash?.value} animateWidth={false} custom={
                        <div className="Item Device">
                            <Icon name={item.platform === 'Android' ? "android" : 'laptop_windows'} />
                            <div className="FlexColumn">
                                <span className="title">{item.deviceModel}</span>
                                <span className="subtitle">{item.appName + ' ' + item.appVersion}</span>
                            </div>
                            <span className="Meta">{item.country}</span>
                        </div>}>
                        <DropdownMenu className="CustomMenu">
                            <div className="Item Device">
                                <Icon name={item.platform === 'Android' ? "android" : 'laptop_windows'} />
                                <div className="FlexColumn">
                                    <span className="title">{item.deviceModel}</span>
                                    <span className="subtitle">{item.appName + ' ' + item.appVersion}</span>
                                </div>
                                <span className="Meta">{item.country}</span>
                            </div>
                            <MenuItem className="danger" title="Terminate Session" onClick={() => terminateSession(item.hash?.value)} />
                        </DropdownMenu>
                    </Menu>
                ))}
            </div>
        </div>
    </div >
}

export default memo(SettingsDevices)