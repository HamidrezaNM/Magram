import { Api } from "telegram";
import { client } from "../../App";

export const MIN_USERNAME_LENGTH = 3; // Some bots have 3-letter usernames
export const MIN_UPDATE_USERNAME_LENGTH = 5; // 4 letter usernames are only available on Fragment
export const MAX_USERNAME_LENGTH = 32;
export const USERNAME_REGEX = /^[a-zA-Z]\w+$/;

export function isUsernameValid(username, isUpdating) {
    const minUsernameLength = isUpdating ? MIN_UPDATE_USERNAME_LENGTH : MIN_USERNAME_LENGTH;
    return username.length >= minUsernameLength
        && username.length <= MAX_USERNAME_LENGTH
        && USERNAME_REGEX.test(username);
}

export async function resolveUsername(username) {
    try {
        const resolveUsername = await client.invoke(new Api.contacts.ResolveUsername({ username }))
        if (resolveUsername.peer.className == 'PeerUser')
            return resolveUsername.users[0]
        else
            return resolveUsername.chats[0]
    } catch (error) {
        return error.errorMessage
    }
}