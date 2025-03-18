import { getStickerDimensions } from "../App/Message/MessageMedia"

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

export function getDocumentImageAttributes(document) {
    return document.attributes?.find(i => i.className === 'DocumentAttributeImageSize')
}

export function getMediaDimensions(media) {
    switch (media.className) {
        case 'MessageMediaPhoto':
            return getPhotoDimensions(media.photo)
        case 'MessageMediaDocument':
            if (isDocumentSticker(media.document)) {
                const attributes = getDocumentImageAttributes(media.document)
                const dimensions = getStickerDimensions(attributes?.w, attributes?.h)
                return { w: dimensions.width, h: dimensions.height }
            }
            if (isDocumentRoundVideo(media.document)) return { w: RoundVideoSize, h: RoundVideoSize }
            return getDocumentVideoAttributes(media.document)
        default:
            break;
    }
}

export function isDocumentPhoto(document) {
    return document.mimeType && document.mimeType.split('/')[0] === 'image'
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
        default:
            return 'Media'
    }
}

// export function getDocumentFileSize(document) {
//     return document.attributes.find(i => i.className === 'DocumentAttributeFilename')?.fileName
// }