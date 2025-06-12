import { useState } from "react"

export default function DropdownMenu({ className, children }) {
    return (
        <div className={"DropdownMenu" + (className ? ` ${className}` : '')}>
            {children}
        </div>
    )
}