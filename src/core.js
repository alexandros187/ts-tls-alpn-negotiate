/**
 * ts-tls-alpn-negotiate
 *
 * Selects the mutually supported application protocol from a ClientHello ALPN
 * list and a server preference order.
 */

/**
 * Negotiate the ALPN protocol to use.
 *
 * Per RFC 7301, the client sends an ordered list of protocols it supports and
 * the server picks one. The server SHOULD select based on its own preference
 * order, not the client's. This function implements that server-side logic.
 *
 * "Server preference wins" is the interpretation chosen here. The first
 * protocol in `serverProtocols` that also appears in `clientProtocols` is
 * returned. If there is no overlap, null is returned, which the caller maps to
 * "no application protocol" — per RFC 7301 the server then proceeds without
 * ALPN or aborts the handshake, a policy decision outside this function.
 *
 * @param {string[]} clientProtocols - ordered protocols advertised by the
 *   client (ClientHello ALPN extension). Order is the client's preference but
 *   is intentionally not honoured here.
 * @param {string[]} serverProtocols - ordered protocols the server supports,
 *   most-preferred first. The server's preference controls selection.
 * @returns {string | null} the selected protocol, or null if no overlap.
 * @throws {TypeError} if either argument is not an array or contains a
 *   non-string element. We validate eagerly because a malformed ALPN list at
 *   the TLS layer indicates a parsing bug upstream that should surface loudly,
 *   not silently produce null.
 */
export function negotiateAlpn(clientProtocols, serverProtocols) {
  if (!Array.isArray(clientProtocols)) {
    throw new TypeError("clientProtocols must be an array");
  }
  if (!Array.isArray(serverProtocols)) {
    throw new TypeError("serverProtocols must be an array");
  }

  for (const proto of clientProtocols) {
    if (typeof proto !== "string") {
      throw new TypeError("clientProtocols must contain only strings");
    }
  }
  for (const proto of serverProtocols) {
    if (typeof proto !== "string") {
      throw new TypeError("serverProtocols must contain only strings");
    }
  }

  const clientSet = new Set(clientProtocols);
  for (const proto of serverProtocols) {
    if (clientSet.has(proto)) {
      return proto;
    }
  }
  return null;
}

/**
 * Convenience wrapper: negotiate and fall back to a default when there is no
 * overlap. Returns the default verbatim (even if it is an empty string) so the
 * caller has full control over fallback semantics.
 *
 * @param {string[]} clientProtocols
 * @param {string[]} serverProtocols
 * @param {string} fallback - returned verbatim when no protocol matches.
 * @returns {string} the selected protocol or the fallback.
 */
export function pickProtocol(clientProtocols, serverProtocols, fallback) {
  if (typeof fallback !== "string") {
    throw new TypeError("fallback must be a string");
  }
  const result = negotiateAlpn(clientProtocols, serverProtocols);
  return result === null ? fallback : result;
}
