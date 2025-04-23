import { calculateMediaDimensions, getStickerDimensions } from "../App/Message/MessageMedia"

const RoundVideoSize = 240

export function getPhotoDimensions(photo) {
    if (!photo.sizes)
        return
    return photo.sizes[photo.sizes?.length - 1]
}

export function getDocumentFileName(document) {
    return document.attributes?.find(i => i.className === 'DocumentAttributeFilename')?.fileName
}

export function getDocumentVideoAttributes(document) {
    return document?.attributes?.find(i => i.className === 'DocumentAttributeVideo')
}

export function getDocumentAudioAttributes(document) {
    return document?.attributes?.find(i => i.className === 'DocumentAttributeAudio')
}

export function getDocumentImageAttributes(document) {
    return document.attributes?.find(i => i.className === 'DocumentAttributeImageSize')
}

export function getMediaDimensions(media, noAvatar = false) {
    switch (media.className) {
        case 'MessageMediaPhoto':
            let photoDimensions = getPhotoDimensions(media.photo)
            return calculateMediaDimensions(photoDimensions?.w, photoDimensions?.h, noAvatar)
        case 'MessageMediaDocument':
            if (isDocumentSticker(media.document)) {
                const attributes = getDocumentImageAttributes(media.document)
                return getStickerDimensions(attributes?.w, attributes?.h)
            }
            if (isDocumentRoundVideo(media.document)) return { width: RoundVideoSize, height: RoundVideoSize }
            let documentDimensions = getDocumentVideoAttributes(media.document)
            return calculateMediaDimensions(documentDimensions?.w, documentDimensions?.h, noAvatar)
        default:
            break;
    }
}

export function isDocumentPhoto(document) {
    return document && document.mimeType && document.mimeType.split('/')[0] === 'image'
}

export function isDocumentVideo(document) {
    return document.mimeType && document.mimeType.split('/')[0] === 'video'
}

export function isDocumentRoundVideo(document) {
    return document.mimeType && document.mimeType.split('/')[0] === 'video' && getDocumentVideoAttributes(document)?.roundMessage
}

export function isDocumentGIF(document) {
    return document.attributes?.find(i => i.className === 'DocumentAttributeAnimated')
}

export function isDocumentSticker(document) {
    return document.attributes?.find(i => i.className === 'DocumentAttributeSticker')
}

export function isDocumentAudio(document) {
    return document?.attributes?.find(i => i.className === 'DocumentAttributeAudio')
}

export function isDocumentVoice(document) {
    return document.attributes?.find(i => i.className === 'DocumentAttributeAudio')?.voice
}

export function getMediaType(media) {
    switch (media.className) {
        case 'MessageMediaPhoto':
            return 'Photo';
        case 'MessageMediaDocument':
            if (isDocumentGIF(media.document)) return 'GIF'
            if (isDocumentSticker(media.document)) return 'Sticker'
            if (isDocumentRoundVideo(media.document)) return 'RoundVideo'
            if (isDocumentVideo(media.document)) return 'Video'
            if (isDocumentPhoto(media.document)) return 'Photo'
            if (isDocumentVoice(media.document)) return 'Voice'
            if (isDocumentAudio(media.document)) return 'Music'
            return 'Document'
        case 'MessageMediaPoll':
            return 'Poll'
        case 'MessageMediaInvoice':
            return 'Invoice'
        default:
            return 'Media'
    }
}

export function getMediaTitle(media) {
    const type = getMediaType(media)

    switch (type) {
        case 'RoundVideo':
            return 'Video message'
        case 'Invoice':
            return media.title ?? 'Invoice'
        default:
            return type
    }
}

// export function getDocumentFileSize(document) {
//     return document.attributes.find(i => i.className === 'DocumentAttributeFilename')?.fileName
// }