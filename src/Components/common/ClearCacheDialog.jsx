import { memo, useState } from "react";
import Dialog, { DialogButton, DialogContent, DialogContentBody, DialogTitle } from "../UI/Dialog";

function ClearCacheDialog({ onClearCache }) {
    const [open, setOpen] = useState(true)

    return <Dialog state={open} onClose={() => setOpen(false)}>
        <DialogContent>
            <DialogContentBody>
                <DialogTitle>
                    Media and documents will stay in the cloud and can be re-downloaded if you need them again.
                </DialogTitle>
            </DialogContentBody>
            <DialogButton className="danger" onClick={() => { onClearCache(true); setOpen(false) }}>
                Clear Cache
            </DialogButton>
        </DialogContent>
        <DialogButton className="Cancel" onClick={() => setOpen(false)}>
            Cancel
        </DialogButton>
    </Dialog>
}

export default memo(ClearCacheDialog)