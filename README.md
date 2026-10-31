# ts-tls-alpn-negotiate

Selects the mutually supported application protocol from a ClientHello ALPN list and a server preference order.

```js
import { negotiateAlpn, pickProtocol } from "ts-tls-alpn-negotiate";

const client = ["h2", "http/1.1"];
const server = ["http/1.1", "h2"];

negotiateAlpn(client, server); // "http/1.1" — server preference wins
pickProtocol(client, server, "http/1.1"); // same, but never null
```

## Why

RFC 7301 lets the server pick freely from the client's offered protocols. Most
implementations use server-side preference order — the first protocol the
server supports that the client also advertised. This library does exactly that
and nothing else, so the selection logic is testable in isolation from the TLS
stack.

The deliberate trade-off: the client's ordering is ignored. If you need
client-preference selection instead, this is the wrong library.

## Edge cases

`negotiateAlpn` returns `null` when the two lists have no overlap. It throws
`TypeError` on non-array inputs or non-string elements rather than silently
returning null — a malformed ALPN list signals a parsing bug upstream that
should surface loudly. `pickProtocol` returns the fallback verbatim, including
an empty string, so the caller controls fallback semantics entirely.

## Design notes

The window stores values eagerly rather than keeping running aggregates. Running
sums drift with floating point over long streams, and recomputing from a small
buffer is cheap enough that the drift is not worth the speed.

