function addParticipants(newlyAdded, action) {
    // console.log("Joined Participants:", newlyAdded);
    newlyAdded.forEach(participant => {
        if (action)
            action(participant)
    })
}

function removeParticipants(leftParticipants, action) {
    // console.log("Left Participants:", leftParticipants);
    leftParticipants.forEach(participant => {
        if (action)
            action(participant)
    })
}

export function updateParticipants({ newParticipants, oldParticipants, onJoined, onLeft }) {
    if (!Array.isArray(newParticipants)) {
        newParticipants = [];
        console.log('new participants is not array')
    }

    if (!oldParticipants?.length) {
        console.log('old participants is empty')
        addParticipants(newParticipants)
        oldParticipants = [...newParticipants]
        return;
    }

    // const addedParticipants = newParticipants.filter(
    //     (newP) => !oldParticipants.current.some((oldP) => oldP.peer.userId === newP.peer.userId || (oldP.peer.userId !== newP.peer.userId && oldP.left && !newP.left))
    // );

    const addedParticipants = newParticipants.filter(newP => {
        const prevP = oldParticipants.find(oldP => Number(oldP.peer.userId) === Number(newP.peer.userId));
        // Is a new participant
        const isNew = !prevP;
        // Is a returned participant
        const hasReturned = prevP && prevP.left && !newP.left;

        return isNew || hasReturned;
    });

    // const removedParticipants = oldParticipants.current.filter(
    //     (oldP) => !newParticipants.some((newP) => newP.id === oldP.id && !newP.left)
    // );

    const removedParticipants = oldParticipants.filter(prevP => {
        const currentP = newParticipants.find(newP => Number(prevP.peer.userId) === Number(newP.peer.userId));
        // Participant has been removed
        const hasBeenRemovedCompletely = !currentP;
        // Participant Left
        const hasLeft = currentP && !prevP.left && currentP.left;

        return hasBeenRemovedCompletely || hasLeft;
    });

    if (addedParticipants.length > 0) {
        addParticipants(addedParticipants, onJoined);
    }

    if (removedParticipants.length > 0) {
        removeParticipants(removedParticipants, onLeft);
    }
}