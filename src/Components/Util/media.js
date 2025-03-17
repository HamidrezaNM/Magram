import { Api } from "telegram";
import { client } from "../../App";
import { getMediaType } from "../Helpers/messages";

export async function downloadMedia(media, param, progressCallback, isThumbnail = false, loadWhenExist = true, type, returnBlob = false, isCustomEmoji = false) {
    const medias = await caches.open('ma-media')

    const mediaType = isCustomEmoji ? 'CustomEmoji' : getMediaType(media)
    const mediaId = media.className === 'MessageMediaPhoto' ? media.photo?.id.value : media.document.id.value

    var resultIsThumb = false;

    var cachedMedia = await medias.match(`${window.location.origin}/${mediaType}${mediaId}${isThumbnail && !loadWhenExist ? '-thumb' : ''}`);

    if (!cachedMedia && isThumbnail) {
        resultIsThumb = true
        cachedMedia = await medias.match(`${window.location.origin}/${mediaType}${mediaId}-thumb`)
    }

    var data

    if (cachedMedia) {
        var blob = await cachedMedia.blob()
        data = returnBlob ? blob : window.URL.createObjectURL(blob)
    } else {
        if (isCustomEmoji) {
            try {
                const document = await client.invoke(new Api.messages.GetCustomEmojiDocuments({ documentId: [mediaId] }))

                media.document = document[0]
            } catch (error) {
                console.log('emoji error', error)
            }
        }

        const buffer = await client.downloadMedia(isCustomEmoji ? media.document : media, {
            ...param, progressCallback: (e) => progressCallback && progressCallback(e)
        })

        var blob = new Blob([buffer], { type });
        data = returnBlob ? blob : window.URL.createObjectURL(blob)

        await medias.put('/' + mediaType + mediaId + (isThumbnail ? '-thumb' : ''), new Response(blob))
    }

    return { data, thumbnail: resultIsThumb };
}

export async function downloadEmoji(documentId) {
    const document = await client.invoke(new Api.messages.GetCustomEmojiDocuments({ documentId: [documentId] }))
    console.log(document)
    // const buffer = await client.downloadMedia(document)

    // var blob = new Blob([buffer], { type });
    // return blob
}