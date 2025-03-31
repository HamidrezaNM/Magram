import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { memo, useEffect, useState } from "react";
import { Profile } from "../App/common";
import { client } from "../../App";
import { Api } from "telegram";
import { useDispatch } from "react-redux";
import { handleToast } from "../Stores/UI";

function JoinChatDialog({ chat, hash }) {
    const [open, setOpen] = useState(true)

    const dispatch = useDispatch()

    const joinChat = async () => {
        try {
            const update = await client.invoke(new Api.messages.ImportChatInvite({
                hash
            }))
        } catch (error) {
            const title = error.errorMessage === 'INVITE_REQUEST_SENT' ? 'Invite request has been sent' : error.errorMessage
            dispatch(handleToast({ icon: 'error', title }))
        }

        setOpen(false)
    }

    const renderChatParticipantsCount = () => {
        return `${chat.participantsCount} ${(chat.broadcast ? 'subscribers' : 'members')}`
    }

    return <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
            sx: {
                background: '#0008',
                backdropFilter: 'blur(25px)',
                borderRadius: '16px'
            }
        }}
        sx={{
            "& > .MuiBackdrop-root": {
                background: "rgba(0, 0, 0, 0.2)"
            }
        }}
    >
        <DialogTitle id="alert-dialog-title" className="flex">
            <Profile entity={chat} name={chat.title} />
            <div className="FlexColumn">
                <span style={{ color: 'var(--text-color)' }}>{chat.title}</span>
                <span style={{
                    fontSize: 14,
                    color: 'var(--secondary-text)'
                }}>{renderChatParticipantsCount()}</span>
            </div>
        </DialogTitle>
        <DialogContent>
            <DialogContentText id="alert-dialog-description">
                {chat.about}
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpen(false)}>CANCEL</Button>
            <Button onClick={joinChat}>
                {chat.requestNeeded ? 'REQUEST TO JOIN' : 'JOIN'}
            </Button>
        </DialogActions>
    </Dialog>
}

export default memo(JoinChatDialog)