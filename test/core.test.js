import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { negotiateAlpn, pickProtocol } from "../src/core.js";

describe("negotiateAlpn", () => {
  it("selects the server's preferred protocol when the client supports it", () => {
    assert.equal(
      negotiateAlpn(["h2", "http/1.1"], ["h2", "http/1.1"]),
      "h2",
    );
  });

  it("honours server preference over client preference", () => {
    // Client prefers http/1.1, but the server prefers h2.
    assert.equal(
      negotiateAlpn(["http/1.1", "h2"], ["h2", "http/1.1"]),
      "h2",
    );
  });

  it("falls back to the next server preference when the top choice is unsupported by the client", () => {
    assert.equal(
      negotiateAlpn(["http/1.1"], ["h3", "h2", "http/1.1"]),
      "http/1.1",
    );
  });

  it("returns null when there is no overlap", () => {
    assert.equal(negotiateAlpn(["h3"], ["h2", "http/1.1"]), null);
  });

  it("returns null when the client list is empty", () => {
    assert.equal(negotiateAlpn([], ["h2"]), null);
  });

  it("returns null when the server list is empty", () => {
    assert.equal(negotiateAlpn(["h2"], []), null);
  });

  it("returns null when both lists are empty", () => {
    assert.equal(negotiateAlpn([], []), null);
  });

  it("handles a single common protocol", () => {
    assert.equal(negotiateAlpn(["http/1.1"], ["http/1.1"]), "http/1.1");
  });

  it("throws TypeError when clientProtocols is not an array", () => {
    assert.throws(() => negotiateAlpn("h2", ["h2"]), TypeError);
  });

  it("throws TypeError when serverProtocols is not an array", () => {
    assert.throws(() => negotiateAlpn(["h2"], "h2"), TypeError);
  });

  it("throws TypeError when a client element is not a string", () => {
    assert.throws(() => negotiateAlpn(["h2", 42], ["h2"]), TypeError);
  });

  it("throws TypeError when a server element is not a string", () => {
    assert.throws(() => negotiateAlpn(["h2"], ["h2", null]), TypeError);
  });
});

describe("pickProtocol", () => {
  it("returns the negotiated protocol when there is a match", () => {
    assert.equal(
      pickProtocol(["h2", "http/1.1"], ["h2", "http/1.1"], "http/1.1"),
      "h2",
    );
  });

  it("returns the fallback when there is no match", () => {
    assert.equal(
      pickProtocol(["h3"], ["h2"], "http/1.1"),
      "http/1.1",
    );
  });

  it("returns an empty-string fallback verbatim", () => {
    assert.equal(pickProtocol(["h3"], ["h2"], ""), "");
  });

  it("throws TypeError when fallback is not a string", () => {
    assert.throws(
      () => pickProtocol(["h2"], ["h2"], null),
      TypeError,
    );
  });
});
