import { memo } from "react"
import Transition from "../App/Transition"

function TabContent({ state, children }) {
    return <div className="TabContent">
        <Transition state={state}>
            {children}
        </Transition>
    </div>
}

export default memo(TabContent)