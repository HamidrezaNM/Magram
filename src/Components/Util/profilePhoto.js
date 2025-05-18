import { client } from "../../App";

export async function profilePhoto(entity) {
    const avatars = await caches.open('ma-media-avatars')

    const cachedAvatar = await avatars.match(window.location.origin + '/avatar-' + Number(entity.photo.photoId))

    var url

    if (cachedAvatar) {
        url = window.URL.createObjectURL(await cachedAvatar.blob())
    } else {
        const buffer = await client.downloadProfilePhoto(entity, { isBig: false });

        var blob = new Blob([buffer], { type: 'image/jpg' });
        url = window.URL.createObjectURL(blob)

        await avatars.put('/avatar-' + Number(entity.photo.photoId), new Response(blob))
    }

    return url
}