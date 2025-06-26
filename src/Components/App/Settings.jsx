import { memo, useCallback, useContext, useEffect, useRef, useState } from "react";
import { BackArrow, Icon, Profile } from "./common";
import { AuthContext, UserContext } from "../Auth/Auth";
import { PageClose, PageHandle, PageHeader, SubPage } from "./Page";
import DropdownMenu from "../UI/DropdownMenu";
import { useDispatch, useSelector } from "react-redux";
import MenuItem from "../UI/MenuItem";
import Menu from "../UI/Menu";
import SettingsGeneral from "./Pages/Settings/General";
import Transition from "./Transition";
import SettingsPrivacy from "./Pages/Settings/Privacy";
import SettingsVoiceVideo from "./Pages/Settings/VoiceVideo";
import SettingsDevices from "./Pages/Settings/Devices";
import { client } from "../../App";
import packageInfo from '../../../package.json';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Skeleton } from "@mui/material";
import SettingsChatSettings from "./Pages/Settings/ChatSettings";
import { Api } from "telegram";
import { handleCoolDown } from "../Util/coolDown";
import FullNameTitle from "../common/FullNameTitle";
import SettingsStorage from "./Pages/Settings/Storage";

function Settings() {
    const [isLoaded, setIsLoaded] = useState(false)
    const [usernameLoading, setUsernameLoading] = useState(false)
    const [username, setUsername] = useState('')
    const [usernameAvailability, setUsernameAvailability] = useState('')
    const [usernameColor, setUsernameColor] = useState('')
    const [openLogoutModal, setOpenLogoutModal] = useState(false)

    const dispatch = useDispatch()
    const User = useContext(UserContext)
    const Auth = useContext(AuthContext)

    const page = useRef()
    const usernameMenu = useRef()

    const subPage = useSelector((state) => state.ui.subPage)
    const centerTopBar = useSelector((state) => state.settings.customTheme.centerTopBar)

    const logOut = async () => {
        await client.invoke(new Api.auth.LogOut())
        localStorage.setItem("authState", 'Welcome');
        localStorage.setItem("auth_key", '');
        Auth.setAuthKey()
        Auth.setAuthState("Welcome");
    }

    const handleUsernameAvailability = (text, color) => {
        setUsernameAvailability(text)
        setUsernameColor(color)
    }

    const handleUsername = async (value) => {
        setUsername(value)
        try {
            handleUsernameAvailability('Checking username...', '')

            const action = async () => {
                const checkUsername = await client.invoke(new Api.account.CheckUsername({ username: value }))

                if (checkUsername)
                    handleUsernameAvailability(value + ' is available', 'success')
                else
                    handleUsernameAvailability('This username is already taken', 'danger')
            }

            handleCoolDown(action)
        } catch (error) {
            switch (error.errorMessage) {
                case 'USERNAME_INVALID':
                    handleUsernameAvailability('This username is invalid', 'danger')
                    break;
                case 'USERNAME_PURCHASE_AVAILABLE':
                    handleUsernameAvailability('This username is currently available for purchase', '')
                    break;
                default:
                    handleUsernameAvailability(error.errorMessage, 'danger')
                    break;
            }
        }

    }

    const SetUsername = async (value) => {
        setUsernameLoading(true)

        const updateUsername = await client.invoke(new Api.account.UpdateUsername({ username: value }))
        console.log('UpdateUsername', updateUsername)

        setUsernameLoading(false)
    }

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    useEffect(() => {
        setUsername(User.username)
    }, [User.username])

    const getSubPageLayout = useCallback(() => {
        switch (subPage[0]?.page) {
            case 'General':
                return <SettingsGeneral />
            case 'Privacy':
                return <SettingsPrivacy />
            case 'Storage':
                return <SettingsStorage />
            case 'ChatSettings':
                return <SettingsChatSettings />
            case 'Devices':
                return <SettingsDevices />
            case 'VoiceVideo':
                return <SettingsVoiceVideo />
            default:
                break;
        }
    }, [subPage])

    return <>
        <div className={"Settings" + (!isLoaded ? ' fadeThrough' : '') + (subPage[0] ? ' pushUp' : '')} ref={page}>
            <PageHeader>
                <div><BackArrow index={0} onClick={() => PageClose(dispatch)} isiOS={centerTopBar} /></div>
                <div className="Title"><span>Settings</span></div>
                <div className="Meta">
                    <Menu icon="more_vert">
                        <DropdownMenu className="top right withoutTitle">
                            <MenuItem icon="edit" title="Edit Name" onClick={() => { }} />
                            <MenuItem icon="logout" className="danger" title="Log Out" onClick={() => setOpenLogoutModal(true)} />
                        </DropdownMenu>
                    </Menu>
                </div>
            </PageHeader>
            <div className="section Info">
                <div className="User">
                    <Profile showPreview entity={User} name={User.firstName} id={User.id?.value} />
                    <div className="name"><FullNameTitle chat={User} /></div>
                </div>
                <div className="Items" style={{ overflow: 'visible' }}>
                    <div className="Item"><Icon name="phone" /><span>+{User.countryCode} {User.phone}</span></div>
                    <Menu ref={usernameMenu} animateWidth={false} closeManually custom={
                        <div className="Item"><Icon name="alternate_email" /><span>{User.username ?? 'Username'}</span></div>}>
                        <DropdownMenu className="CustomMenu Horizontally">
                            <div className="Item preWrap">
                                <Icon name="alternate_email" />
                                <div className="FlexColumn">
                                    <input type="text" spellCheck="false" style={{ height: 60, flex: 'auto' }} placeholder="Username" value={username} onInput={(e) => handleUsername(e.target.value)} />
                                    {usernameAvailability != '' && <span className={usernameColor} style={{ fontSize: 16, padding: 0, paddingBottom: 10 }}>{usernameAvailability}</span>}
                                </div>
                            </div>
                            <div className="flex">
                                <MenuItem title="Cancel" icon="close" onClick={() => usernameMenu.current.handleCloseMenu()} />
                                <hr />
                                <MenuItem className={usernameLoading ? 'Loading' : ''} title="Apply" icon="done" onClick={() => SetUsername()} />
                            </div>
                        </DropdownMenu>
                    </Menu>
                    <div className="Item"><Icon name="info" /><span>{User.bio}</span></div>
                </div>
            </div>
            <div className="section SettingsItems">
                <div className="Items">
                    <div className="Item" onClick={() => PageHandle(dispatch, 'General', 'General', true)}><Icon name="settings" /><span>General</span></div>
                    <div className="Item" onClick={() => PageHandle(dispatch, 'Privacy', 'Privacy and Security', true)}><Icon name="lock" /><span>Privacy and Security</span></div>
                    <div className="Item" onClick={() => PageHandle(dispatch, 'Storage', 'Storage', true)}><Icon name="database" /><span>Storage</span></div>
                    <div className="Item" onClick={() => PageHandle(dispatch, 'ChatSettings', 'Chat Settings', true)}><Icon name="chat" /><span>Chat Settings</span></div>
                    <div className="Item" onClick={() => PageHandle(dispatch, 'Devices', 'Devices', true)}><Icon name="devices" /><span>Devices</span></div>
                </div>
            </div>
            <div className="AppVersion">Magram Web v{packageInfo.version}</div>
        </div>
        <Transition state={subPage[0]}><SubPage>{getSubPageLayout()}</SubPage></Transition>
        <Dialog
            open={openLogoutModal}
            onClose={() => setOpenLogoutModal(false)}
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
                {"Logout"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Are you sure you want to logout {User?.firstName}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenLogoutModal(false)}>CANCEL</Button>
                <Button color="error" onClick={logOut}>
                    LOG OUT
                </Button>
            </DialogActions>
        </Dialog>
    </>
}

export default memo(Settings)