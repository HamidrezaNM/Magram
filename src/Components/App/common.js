import { useCallback, useEffect, useRef, useState } from "react"
import { client } from "../../App"
import { profilePhoto } from "../Util/profilePhoto"

export function Icon({ name, size = 24, color = null, onClick, className = null }) {
    return <div className={"icon" + (className ? ' ' + className : '')} style={{ fontSize: size + 'px' }} onClick={onClick}>{name}</div>
}

export function Profile({ entity, image, name, id, size = 48, isSavedMessages }) {
    const [photo, setPhoto] = useState()

    const img = useRef()

    useEffect(() => {
        if (entity && entity.photo?.photoId) {
            (async () => {
                try {
                    const url = await profilePhoto(entity)

                    setPhoto(url)
                } catch (error) {
                    throw error;
                }
            })()
        }
    }, [])

    return <div className={"profile" + (id ? ' peer-color-' + getPeerColorIndexById(id) : '')} style={{ width: size + 'px', height: size + 'px', fontSize: size / 2 + 'px' }}>
        {isSavedMessages ? <Icon name="bookmark" size={28} /> :
            <><span>{name ? name.toString().charAt(0).toUpperCase() : ''}</span>
                {photo && <img ref={img} style={{ width: size + 'px', height: size + 'px' }} src={photo} />}</>}
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

export function getChatColor(id) {
    return ' peer-color-' + getPeerColorIndexById(id)
}

export function getPeerColorIndexById(peerId) {
    return Math.abs(Number(peerId)) % 7;
}