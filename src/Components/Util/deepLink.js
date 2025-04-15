import { RE_TG_LINK, RE_TME_LINK } from "../../config";
import { isUsernameValid } from "./username";

function isDeepLink(link) {
    return link.match(RE_TME_LINK) || link.match(RE_TG_LINK)
}

export function parseDeepLink(link) {
    if (!isDeepLink(link)) return

    const urlParsed = new URL(link)

    return parseHttpLink(urlParsed)
}

function parseHttpLink(link) {
    const queryParams = getQueryParams(link);
    const pathParams = getPathParams(link);

    const linkType = getHttpLinkType(queryParams, pathParams)

    switch (linkType) {
        case 'publicUsernameOrBotLink':
            return {
                type: 'publicUsernameOrBotLink',
                username: pathParams[0],
                start: queryParams.start,
                text: queryParams.text,
                startApp: queryParams.startapp
            }
        case 'privateChannelLink':
            return {
                type: 'privateChannelLink',
                channelId: pathParams[1]
            }
        case 'inviteLink':
            return {
                type: 'inviteLink',
                hash: pathParams[0].substring(1)
            }
        case 'joinchatLink':
            return {
                type: 'inviteLink',
                hash: pathParams[1]
            }
        case 'proxy':
            return {
                type: 'proxy'
            }
    }
}

function getHttpLinkType(queryParams, pathParams) {
    const len = pathParams.length
    const method = pathParams[0]

    if (len === 1) {
        if (method === 'proxy') return 'proxy' // Proxy doesn't supported
        if (method.charAt(0) === '+') return 'inviteLink'
        if (isUsernameValid(method))
            return 'publicUsernameOrBotLink'
    } else if (len === 2) {
        switch (method) {
            case 'c':
                return 'privateChannelLink'
            case 'joinchat':
                return 'joinchatLink'
        }
        if (isUsernameValid(method))
            return 'publicUsernameOrBotLink'
    }

}

function getPathParams(url) {
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts[0] === 's') {
        parts.shift();
    }
    return parts.map(decodeURI);
}

function getQueryParams(url) {
    return Object.fromEntries(url.searchParams);
}