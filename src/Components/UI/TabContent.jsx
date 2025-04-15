import { memo } from "react"
import Transition from "../App/Transition"

function TabContent({ state, children }) {
    return <Transition state={state}>
        <div className="TabContent">
            {children}
        </div>
    </Transition>
}

export default memo(TabContent)