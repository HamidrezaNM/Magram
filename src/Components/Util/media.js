import { Api } from "telegram";
import { client } from "../../App";
import { getMediaType } from "../Helpers/messages";

export async function downloadMedia(media, param, progressCallback, isThumbnail = false, loadWhenExist = true, type, returnBlob = false, isCustomEmoji = false) {
    const medias = await caches.open('ma-media')

    const mediaType = isCustomEmoji ? 'CustomEmoji' : getMediaType(media)
    const mediaId = media.className === 'MessageMediaPhoto' ? media.photo?.id.value : media.document.id.value

    var resultIsThumb = false;

    var cachedMedia = await medias.match(`${window.location.origin}/${mediaType}${mediaId}${isThumbnail && !loadWhenExist ? '-thumb' : ''}`);

    var mimeType

    if (!cachedMedia && isThumbnail) {
        resultIsThumb = true
        cachedMedia = await medias.match(`${window.location.origin}/${mediaType}${mediaId}-thumb`)
    }

    var data

    if (cachedMedia) {
        var blob = await cachedMedia.blob()
        data = returnBlob ? blob : window.URL.createObjectURL(blob)
        mimeType = cachedMedia.headers.get('Content-Type')
    } else {
        if (isCustomEmoji) {
            try {
                const document = await client.invoke(new Api.messages.GetCustomEmojiDocuments({ documentId: [mediaId] }))

                media.document = document[0]
                console.log(document)
            } catch (error) {
                console.log('emoji error', error)
            }
        }

        const buffer = await client.downloadMedia(isCustomEmoji ? media.document : media, {
            ...param, progressCallback: (e) => progressCallback && progressCallback(e)
        })

        var blob = new Blob([buffer], { type });
        data = returnBlob ? blob : window.URL.createObjectURL(blob)
        mimeType = mediaType === 'Photo' ? 'image/jpg' : media.document?.mimeType

        await medias.put('/' + mediaType + mediaId + (isThumbnail ? '-thumb' : ''), new Response(blob, { headers: new Headers({ "Content-Type": mimeType ?? null }) }))
    }

    return { data, thumbnail: resultIsThumb, mimeType };
}

export async function downloadEmoji(documentId) {
    const document = await client.invoke(new Api.messages.GetCustomEmojiDocuments({ documentId: [documentId] }))
    console.log(document)
    // const buffer = await client.downloadMedia(document)

    // var blob = new Blob([buffer], { type });
    // return blob
}