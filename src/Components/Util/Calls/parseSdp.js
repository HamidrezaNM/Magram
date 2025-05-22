export function parseSdp(sdp) {
    const lines = sdp.split('\r\n');

    const lookup = (prefix) => {
        for (let line of lines) {
            if (line.startsWith(prefix)) {
                return line.substr(prefix.length);
            }
        }
        return null;
    };

    const rawSource = lookup('a=ssrc:');
    const rawSourceGroup = lookup('a=ssrc-group:FID ');

    return {
        fingerprint: lookup('a=fingerprint:')?.split(' ')[1] ?? null,
        hash: lookup('a=fingerprint:')?.split(' ')[0] ?? null,
        setup: lookup('a=setup:'),
        pwd: lookup('a=ice-pwd:'),
        ufrag: lookup('a=ice-ufrag:'),
        source: rawSource ? Number(rawSource.split(' ')[0]) : null,
        sourceGroup: rawSourceGroup
            ? rawSourceGroup.split(' ').map(Number)
            : null,
    };
}