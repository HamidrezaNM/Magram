import { useSelector } from "react-redux"
import Toast from "./Toast"
import { memo } from "react"

function Toasts() {

    const toasts = useSelector((state) => state.ui.toasts)

    return <div className="Toasts">
        {toasts.map(toast => {
            return <Toast
                icon={toast.icon}
                profile={toast.profile}
                title={toast.title}
            />
        })}
    </div>
}

export default memo(Toasts)