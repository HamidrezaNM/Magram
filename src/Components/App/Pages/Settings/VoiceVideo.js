import { memo, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PageClose, PageHeader } from "../../Page";
import { Icon, Switch } from "../../common";
import { UserContext } from "../../../Auth/Auth";
import { FormControl, InputLabel, MenuItem, Select, Slider } from "@mui/material";
import Menu from "../../../UI/Menu";
import DropdownMenu from "../../../UI/DropdownMenu";
import { handleVoiceOutputVolume } from "../../../Stores/UI";

function SettingsVoiceVideo() {
    const [isLoaded, setIsLoaded] = useState(false)
    const [inputDevice, setInputDevice] = useState(0)
    const [outputVolume, setOutputVolume] = useState(50)
    const [inputDevices, setInputDevices] = useState()

    const page = useRef()

    const dispatch = useDispatch()

    const voiceOutputVolume = useSelector((state) => state.ui.value.voiceOutputVolume)

    useEffect(() => {
        setIsLoaded(true)

        setOutputVolume(voiceOutputVolume)

        navigator.mediaDevices.enumerateDevices().then((devices) => {
            setInputDevices(devices.filter(device => device.kind === 'audioinput'))
            setInputDevice(devices.filter(device => device.kind === 'audioinput')[0])
            console.log(devices)
        })
    }, [])

    const handleOutputVolume = (event, newValue) => {
        setOutputVolume(newValue)
        dispatch(handleVoiceOutputVolume(newValue))
    }

    const handleInputDevice = (event) => {
        setInputDevice(event.target.value);
    };

    return <div className={"SettingsVoiceVideo" + (!isLoaded ? ' fadeThrough' : '')} ref={page}>
        <PageHeader>
            <div><Icon name="arrow_back" className="backBtn" onClick={() => PageClose(dispatch, true)} /></div>
            <div className="Title"><span>Voice & Video</span></div>
            <div className="Meta"></div>
        </PageHeader>
        <div className="section Notifications">
            <div className="Items">
                <span className="title">Voice Settings</span>
                <div className="Item"><span>Input Device</span>
                    <FormControl sx={{ width: '50%' }}>
                        <Select
                            value={inputDevice}
                            onChange={handleInputDevice}
                        >
                            {inputDevices && inputDevices.map((device) => (
                                <MenuItem
                                    key={device.deviceId}
                                    value={device}
                                >
                                    {device.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
                <div className="Item">
                    <span>Output Volume</span>
                    <Slider aria-label="Volume" valueLabelDisplay="auto" value={outputVolume} onChange={handleOutputVolume} />
                </div>
            </div>
        </div>
    </div>
}

export default memo(SettingsVoiceVideo)