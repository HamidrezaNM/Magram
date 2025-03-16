import { client } from "../../App";
import { getMediaType } from "../Helpers/messages";

export async function downloadMedia(media, param, progressCallback, isThumbnail = false, loadWhenExist = true, type) {
    const medias = await caches.open('ma-media')

    const mediaType = getMediaType(media)
    const mediaId = media.className === 'MessageMediaPhoto' ? media.photo?.id.value : media.document.id.value

    var resultIsThumb = false;

    var cachedMedia = await medias.match(`${window.location.origin}/${mediaType}${mediaId}${isThumbnail && !loadWhenExist ? '-thumb' : ''}`);

    if (!cachedMedia && isThumbnail) {
        resultIsThumb = true
        cachedMedia = await medias.match(`${window.location.origin}/${mediaType}${mediaId}-thumb`)
    }

    var url

    if (cachedMedia)
        url = window.URL.createObjectURL(await cachedMedia.blob())
    else {
        const buffer = await client.downloadMedia(media, {
            ...param, progressCallback: (e) => progressCallback && progressCallback(e)
        })

        var blob = new Blob([buffer], { type });
        url = window.URL.createObjectURL(blob)

        await medias.put('/' + mediaType + mediaId + (isThumbnail ? '-thumb' : ''), new Response(blob))
    }

    return { url, thumbnail: resultIsThumb };
}