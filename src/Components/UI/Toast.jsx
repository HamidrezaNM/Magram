import { memo, useEffect, useState } from "react";
import { Icon, Profile } from "../App/common";
import Transition from "../App/Transition";
import { getUserFullName } from "../Helpers/users";

function Toast({ icon, title, profile }) {
    const [show, setShow] = useState(true)

    useEffect(() => {
        setTimeout(() => {
            setShow(false)
        }, 2000);
    }, [])

    return <Transition state={show}>
        <div className="Toast">
            {icon && <Icon name={icon} />}
            {profile && <Profile size={24} entity={profile} id={profile.id} name={getUserFullName(profile)} />}
            <span>{title}</span>
        </div>
    </Transition>
}

export default memo(Toast)