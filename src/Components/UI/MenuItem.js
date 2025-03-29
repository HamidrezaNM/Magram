import { Profile } from "../App/common";

export default function MenuItem({ icon, profile, title, subtitle, onClick, style, className }) {
    return (
        <div className={"MenuItem" + (className ? ` ${className}` : '') + (subtitle ? ' withSubtitle' : '')} style={style} onClick={onClick}>
            {icon && <div className="icon">{icon}</div>}
            {profile && <Profile size={30} entity={profile} name={profile.firstName ?? profile.title} id={profile.id.value} />}
            <div>
                <div className="title">{title}</div>
                {subtitle && <div className="subtitle">{subtitle}</div>}
            </div>
        </div>
    )
}