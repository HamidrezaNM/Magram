import { useCallback, useEffect, useRef, useState } from "react"
import { client } from "../../App"
import { profilePhoto } from "../Util/profilePhoto"
import buildClassName from "../Util/buildClassName"
import Transition from "./Transition"
import { handleMediaPreview } from "../Stores/UI"
import { useDispatch } from "react-redux"

export function Icon({ name, size = 24, color = null, onClick, className = null }) {
    return <div className={"icon" + (className ? ' ' + className : '')} style={{ fontSize: size + 'px' }} onClick={onClick}>{name}</div>
}

export function Profile({ entity, image, name, id, size = 48, isSavedMessages, showPreview = false }) {
    const [photo, setPhoto] = useState()

    const profile = useRef()
    const img = useRef()

    const dispatch = useDispatch()

    const handlePreview = () => {
        if (!showPreview || !photo) return

        dispatch(handleMediaPreview({ from: entity, media: entity.photo, mediaSrc: photo, date: entity.date, element: profile.current }))
    }

    useEffect(() => {
        if (entity && entity.photo?.photoId) {
            (async () => {
                try {
                    const url = await profilePhoto(entity)

                    setPhoto(url)
                } catch (error) {
                    console.error(error)
                }
            })()
        }
    }, [entity?.photo])

    return <div
        ref={profile}
        className={buildClassName(
            "profile",
            'peer-color-' + getPeerColorIndexById(id))}
        style={{
            width: size + 'px',
            height: size + 'px',
            fontSize: size / 2 + 'px',
            cursor: showPreview && 'pointer'
        }} onClick={handlePreview}>
        {isSavedMessages ? <Icon name="bookmark" size={28} /> :
            <>
                <span>{name ? Array.from(name.toString())[0].toUpperCase() : ''}</span>
                <Transition state={!!photo}>
                    <img ref={img} style={{ width: size + 'px', height: size + 'px' }} src={photo} />
                </Transition>
            </>}
    </div>
}

export function Switch({ checked = false, setChecked }) {
    const onChange = useCallback(() => {
        if (setChecked)
            setChecked(!checked)
    }, [checked, setChecked])
    return <label className="switch">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="slider"></span>
    </label>
}

export function CheckBox({ checked = false, setChecked, style }) {
    const onChange = useCallback(() => {
        if (setChecked)
            setChecked(!checked)
    }, [checked, setChecked])
    return <label className="checkbox" style={style}>
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="checkmark"></span>
    </label>
}

export function BackArrow({ onClick, className, isiOS = false, title, index = 0 }) {
    const [state, setState] = useState(true)

    const prevIndex = useRef(0)

    useEffect(() => {
        setState(index > prevIndex.current)

        prevIndex.current = index
    }, [index])

    return isiOS ?
        <Transition state={state} alwaysShow>
            <div className="BackButton" onClick={onClick}>
                <Icon name="arrow_back_ios_new" className={buildClassName("BackArrow", className)} size={24} />
                <span>{title ?? 'Back'}</span>
            </div>
        </Transition>
        : <Icon name="arrow_back" className={buildClassName("BackArrow", className)} onClick={onClick} />
}

export function getChatColor(id) {
    return 'peer-color-' + getPeerColorIndexById(id)
}

export function getPeerColorIndexById(peerId) {
    return Math.abs(Number(peerId)) % 7;
}

export function Item({ className, onClick, unchangeable = false, children }) {
    const [animate, setAnimate] = useState(false)

    const handleUnchangeableClick = () => {
        navigator.vibrate(10)
        setAnimate(true)

        setTimeout(() => {
            navigator.vibrate(10)
            setAnimate(false)
        }, 150);
    }

    return <div className={buildClassName("Item", className, unchangeable && 'unchangeable', animate && 'animate')} onClick={!unchangeable ? onClick : handleUnchangeableClick}>
        {children}
    </div>
}