import { describe, expect, it } from "vitest";
import { __ipv6TransitionInternal, ipv6TransitionAddresses } from "../src/ops/ipv6TransitionAddresses.js";
import { parseTlsRecord, __tlsRecordInternal } from "../src/ops/parseTlsRecord.js";
import { parseX509Certificate } from "../src/ops/parseX509Certificate.js";
import { parseX509Crl } from "../src/ops/parseX509Crl.js";
import {
  __x509Internal,
  parseX509CertificateBytes,
  parseX509CrlBytes,
  parseX509Input
} from "../src/ops/x509Utils.js";

function der(tag: number, ...content: Uint8Array[]): Uint8Array {
  const size = content.reduce((sum, chunk) => sum + chunk.length, 0);
  if (size >= 0x80) {
    throw new Error("Test DER helper only supports short-form lengths");
  }
  const out = new Uint8Array(2 + size);
  out[0] = tag;
  out[1] = size;
  let offset = 2;
  for (const chunk of content) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

function textBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function seq(...children: Uint8Array[]): Uint8Array {
  return der(0x30, ...children);
}

function set(...children: Uint8Array[]): Uint8Array {
  return der(0x31, ...children);
}

function integer(...bytes: number[]): Uint8Array {
  return der(0x02, new Uint8Array(bytes));
}

function printable(value: string): Uint8Array {
  return der(0x13, textBytes(value));
}

function utcTime(value: string): Uint8Array {
  return der(0x17, textBytes(value));
}

function oid(...bytes: number[]): Uint8Array {
  return der(0x06, new Uint8Array(bytes));
}

const TEST_CERT_PEM = `-----BEGIN CERTIFICATE-----
MIIDbzCCAlegAwIBAgIUCABVjT3MsNUh+DVgwheQqZ0Q6dMwDQYJKoZIhvcNAQEL
BQAwRzEeMBwGA1UEAwwVY3liZXJtYXN0ZXJjaGVmLmxvY2FsMRgwFgYDVQQKDA9D
eWJlck1hc3RlckNoZWYxCzAJBgNVBAYTAlBMMB4XDTI2MDMxMTE3MzYwN1oXDTI3
MDMxMTE3MzYwN1owRzEeMBwGA1UEAwwVY3liZXJtYXN0ZXJjaGVmLmxvY2FsMRgw
FgYDVQQKDA9DeWJlck1hc3RlckNoZWYxCzAJBgNVBAYTAlBMMIIBIjANBgkqhkiG
9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvkr3jvQXX+1anzhnV+3g9WxC+EvhCLozbhxT
SjYoSNh9tDEZLuuB4MtGEoararWu7nSqToRFm5Aq31tE1HIi2YHV+HguZDYcLo68
NMXVsRz+Sndtc4Hy96JzFDK5P5oFxxf5OptiMVSPqHF3wPYbojDyb+VdJ+cv+56k
NStVHNc7s1fqQWdSBaI7RxeaOnd6Fa8ulkDbnqBNSXNPXYhCYK+5sIo5/uhq+LJY
RpkSu8F30Y3FVEqT48RBIyHJBGS1VGc6BqQDAetD1kIyLobxjte+r0CH+4zxU0If
yyWUPk5ZD5MUBG8HIwevyUOXtUMbUWEvpGbCb1k33SQv4DWMJQIDAQABo1MwUTAd
BgNVHQ4EFgQUJasvV7cLiEsMmY+lY0z/BY77w7IwHwYDVR0jBBgwFoAUJasvV7cL
iEsMmY+lY0z/BY77w7IwDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOC
AQEAneZ+uwSUnQWXatfsILbsTOuO0b7wYtBW6W5XCMF/hstP4OWXAMDjnNxBzOtV
Iic4kC+FrUI2D98LptdEuZgr0YQbg040KT8humgXaUl9ln4AXx/ftOA7vwHHQCOp
HCG4qybefaX9pveQiXqFMVW9RjiuZ05nt51pbvoLPXc0xITRj9ln2u4emC72+gKJ
8xpRJ+Bcn47/vdPU3UsZRe6xN3xu4sb25ormLgC6ST3KVC5midhT4k9s0HgoRd8/
Dwhr8089H6EseuS53qNSz6YhSsqvmqXqRhZb5aZfBtTyxRnAaFyTSpY6L9leDsg1
ChAElaYK6IS3khN6lXxpR1ETjQ==
-----END CERTIFICATE-----`;

const TEST_CRL_PEM = `-----BEGIN X509 CRL-----
MIIBnjCBhwIBATANBgkqhkiG9w0BAQsFADBEMRswGQYDVQQDDBJDeWJlck1hc3Rl
ckNoZWYgQ0ExGDAWBgNVBAoMD0N5YmVyTWFzdGVyQ2hlZjELMAkGA1UEBhMCUEwX
DTI2MDMxMTE3MzYwN1oXDTI2MDQxMDE3MzYwN1qgDzANMAsGA1UdFAQEAgIQADAN
BgkqhkiG9w0BAQsFAAOCAQEAdzX+KXLrrXZSo/AZ8d72ifNAYsvqTLjX020vtNzt
+vwkKf238xZUzWc3cjA3y0bmezudenVxgP3xDikx9rp3iIR1BjNsZ5aOnItdSbjJ
nHs7xyeWOoBiv/fLXGyT5sLrI1GNFXaf8JiiYnwP5ZqHGkKnb3ul6LfKRk+7kE3P
JnlE6+b4fpWF1ta9oS4uwb16G08KeFFnr6uop12P7VfABW6yFSjzE7RfTFjTflPy
eYCY7W5FnmP4WbhFJSypYYE9IqBHPud7Rz35utY5/e68aNmBYB6FAfMne95vAOuS
JlqbNkL/3MFnoDcndGWdfdmo9NH/62Frdy864yED9LGZ7g==
-----END X509 CRL-----`;

const TEST_LEAF_CERT_PEM = `-----BEGIN CERTIFICATE-----
MIIDHDCCAgQCFGd2MFKa0XWuwItgQ7FkYslR9OPfMA0GCSqGSIb3DQEBCwUAMEkx
IDAeBgNVBAMMF0N5YmVyTWFzdGVyQ2hlZiBUZXN0IENBMRgwFgYDVQQKDA9DeWJl
ck1hc3RlckNoZWYxCzAJBgNVBAYTAlBMMB4XDTI2MDMxMTE3NDEzM1oXDTI3MDMx
MTE3NDEzM1owTDEjMCEGA1UEAwwabGVhZi5jeWJlcm1hc3RlcmNoZWYubG9jYWwx
GDAWBgNVBAoMD0N5YmVyTWFzdGVyQ2hlZjELMAkGA1UEBhMCUEwwggEiMA0GCSqG
SIb3DQEBAQUAA4IBDwAwggEKAoIBAQCwIp+PAQHrka0KJ2INxqapSMXzrL9ISqxt
LuXLXjGlJA6LOULoekd7elx0gBTmClv9ulyr1mwvLd5n999yxAiVOfHVl6adkH9y
0PkcSvZgfvEGnccM9K71nT+I2cgW/Jlts1HzSZxcW3cwc3f9O8yxbiYqj1tGeHOx
BFjJ3geImnobF8A2DkT4Lu469+UHAvfK1JnyUu1nfYcTEpuGHfYu7Oeeaej6PGVn
4rdDY13CF3St+il9UI/e2XaWzNPSD2ftYzWEN/7o0MpHzScooPzJc6mtKW1F+hv0
VRYXL52b6WecvjXtaXJinsf7RLfEKFjaNE0oRkRtAp3A0TgVW7ZfAgMBAAEwDQYJ
KoZIhvcNAQELBQADggEBAGk8Lc7ZoYinVEOe2Hx57Wx7wibdkGYcsHUViWkKx/cN
0BRnu+/HueXLFRUilKuS/9zyiXZJFGjhuSEmAVcJxCOCWs4KE+NRUhuuXPL1pEr/
KCJ+JDuFT5iEAf+qIkmioW9dTMzCXGG/QoR2zBznDb8SnyERx8Yj8CprIl0hkjW+
1Eb9JQVMIR+qpIDSelPvNsqygnJNcTQv+37qAQb3voD1GemQG68gLTFytNXdR/JS
ohLqPREKYYzSD0MQABe8kDEvlChwguexIZWARBMrYDCJUvQzs+cXL95D9oTmSQxu
8Le7qJ26TIY9SRxQ/G+BFB6zfU5YAK2AF6wEytLdAzU=
-----END CERTIFICATE-----`;

describe("network advanced parity helpers", () => {
  it("covers IPv6 transition helper branches", () => {
    expect(__ipv6TransitionInternal.toIpv4String(0xc000, 0x0204)).toBe("192.0.2.4");
    expect(__ipv6TransitionInternal.invertHextet(0xffd2)).toBe(0x002d);
    expect(__ipv6TransitionInternal.describeTransition("fe80::5efe:c000:0201")).toEqual({
      address: "fe80::5efe:c000:0201",
      scheme: "isatap",
      embeddedIpv4: "192.0.2.1"
    });
    expect(__ipv6TransitionInternal.describeTransition("fe80::200:5efe:c000:0202")).toEqual({
      address: "fe80::200:5efe:c000:0202",
      scheme: "isatap",
      embeddedIpv4: "192.0.2.2"
    });
    expect(__ipv6TransitionInternal.describeTransition("2001:db8::1")).toEqual({
      address: "2001:db8::1",
      scheme: "none"
    });
    expect(ipv6TransitionAddresses.run({ input: { type: "string", value: " " }, args: {} })).toEqual({
      type: "json",
      value: []
    });
    expect(() =>
      ipv6TransitionAddresses.run({
        input: { type: "bytes", value: new Uint8Array() } as never,
        args: {}
      })
    ).toThrow("Expected string input");
  });

  it("covers TLS parsing helper branches and errors", () => {
    const rawBytes = new Uint8Array([0x16, 0x03, 0x01, 0x00, 0x00]);
    expect(__tlsRecordInternal.parseInput(rawBytes)).toBe(rawBytes);
    expect(Array.from(__tlsRecordInternal.parseInput("1603030000"))).toEqual([0x16, 0x03, 0x03, 0x00, 0x00]);
    expect(new TextDecoder().decode(__tlsRecordInternal.parseInput("abc"))).toBe("abc");
    expect(__tlsRecordInternal.decodeContentType(20)).toBe("change_cipher_spec");
    expect(__tlsRecordInternal.decodeContentType(21)).toBe("alert");
    expect(__tlsRecordInternal.decodeContentType(24)).toBe("heartbeat");
    expect(__tlsRecordInternal.decodeContentType(25)).toBe("unknown");
    expect(__tlsRecordInternal.decodeVersion(3, 0)).toBe("SSL 3.0");
    expect(__tlsRecordInternal.decodeVersion(3, 1)).toBe("TLS 1.0");
    expect(__tlsRecordInternal.decodeVersion(3, 2)).toBe("TLS 1.1");
    expect(__tlsRecordInternal.decodeVersion(3, 4)).toBe("TLS 1.3");
    expect(__tlsRecordInternal.decodeVersion(1, 1)).toBe("unknown (1.1)");
    expect(__tlsRecordInternal.decodeHandshakeType(2)).toBe("server_hello");
    expect(__tlsRecordInternal.decodeHandshakeType(11)).toBe("certificate");
    expect(__tlsRecordInternal.decodeHandshakeType(12)).toBe("server_key_exchange");
    expect(__tlsRecordInternal.decodeHandshakeType(13)).toBe("certificate_request");
    expect(__tlsRecordInternal.decodeHandshakeType(14)).toBe("server_hello_done");
    expect(__tlsRecordInternal.decodeHandshakeType(16)).toBe("client_key_exchange");
    expect(__tlsRecordInternal.decodeHandshakeType(20)).toBe("finished");
    expect(__tlsRecordInternal.decodeHandshakeType(99)).toBe("unknown");
    expect(__tlsRecordInternal.decodeHandshakeType(undefined)).toBeNull();
    expect(() =>
      parseTlsRecord.run({ input: { type: "json", value: {} } as never, args: {} })
    ).toThrow("Expected bytes or string input");
    expect(() =>
      parseTlsRecord.run({ input: { type: "string", value: "" }, args: {} })
    ).toThrow("Expected at least one TLS record");
    expect(() =>
      parseTlsRecord.run({ input: { type: "string", value: "1603030004010000" }, args: {} })
    ).toThrow("TLS record length exceeds input size");
  });

  it("covers X.509 utility branches and error handling", () => {
    const certBytes = parseX509Input(TEST_CERT_PEM, "CERTIFICATE");
    const crlBytes = parseX509Input(TEST_CRL_PEM, "X509 CRL");
    expect(parseX509Input(certBytes, "CERTIFICATE")).toBe(certBytes);
    expect(Array.from(parseX509Input("30 00", "CERTIFICATE"))).toEqual([0x30, 0x00]);
    expect(new TextDecoder().decode(parseX509Input("plain-text", "CERTIFICATE"))).toBe("plain-text");
    expect(__x509Internal.parsePemBlock(TEST_CERT_PEM, "CERTIFICATE")).toEqual(certBytes);
    expect(__x509Internal.parsePemBlock("missing", "CERTIFICATE")).toBeNull();
    expect(__x509Internal.parseAsn1Node(new Uint8Array([0x30, 0x00]), 2)).toBeNull();
    expect(__x509Internal.parseAsn1Node(new Uint8Array([0x30, 0x00]), 0)?.tag).toBe(0x30);
    expect(__x509Internal.parseAsn1Node(new Uint8Array([0x30]), 0)).toBeNull();
    expect(__x509Internal.parseAsn1Node(new Uint8Array([0x30, 0x82, 0x01]), 0)).toBeNull();
    expect(__x509Internal.parseAsn1Node(new Uint8Array([0x30, 0x81, 0x01, 0x00]), 0)?.contentEnd).toBe(4);
    const badChildrenRoot = __x509Internal.parseAsn1Node(new Uint8Array([0x30, 0x02, 0x01, 0x80]), 0);
    expect(badChildrenRoot).not.toBeNull();
    expect(__x509Internal.parseAsn1Children(new Uint8Array([0x30, 0x02, 0x01, 0x80]), badChildrenRoot!)).toEqual([]);
    expect(__x509Internal.decodeOid(new Uint8Array([]))).toBe("");
    expect(__x509Internal.decodeOid(new Uint8Array([0x55, 0x04, 0x03]))).toBe("2.5.4.3");
    expect(__x509Internal.decodeOid(new Uint8Array([0x55, 0x84]))).toBe("2.5");
    const utf8Node = __x509Internal.parseAsn1Node(new Uint8Array([0x0c, 0x02, 0x41, 0x42]), 0)!;
    expect(__x509Internal.decodeAsn1String(new Uint8Array([0x0c, 0x02, 0x41, 0x42]), utf8Node)).toBe("AB");
    const bmpBytes = new Uint8Array([0x1e, 0x04, 0x00, 0x41, 0x00, 0x42]);
    const bmpNode = __x509Internal.parseAsn1Node(bmpBytes, 0)!;
    expect(__x509Internal.decodeAsn1String(bmpBytes, bmpNode)).toBe("AB");
    const oddBmpBytes = new Uint8Array([0x1e, 0x03, 0x00, 0x41, 0x00]);
    const oddBmpNode = __x509Internal.parseAsn1Node(oddBmpBytes, 0)!;
    expect(__x509Internal.decodeAsn1String(oddBmpBytes, oddBmpNode)).toBeNull();
    const unknownNode = __x509Internal.parseAsn1Node(new Uint8Array([0x05, 0x00]), 0)!;
    expect(__x509Internal.decodeAsn1String(new Uint8Array([0x05, 0x00]), unknownNode)).toBeNull();
    for (const tag of [0x13, 0x14, 0x16, 0x1a]) {
      const bytes = new Uint8Array([tag, 0x02, 0x41, 0x42]);
      const node = __x509Internal.parseAsn1Node(bytes, 0)!;
      expect(__x509Internal.decodeAsn1String(bytes, node)).toBe("AB");
    }
    const utcBytes = new Uint8Array([0x17, 0x0d, ...new TextEncoder().encode("260311173607Z")]);
    const utcNode = __x509Internal.parseAsn1Node(utcBytes, 0)!;
    expect(__x509Internal.decodeAsn1Time(utcBytes, utcNode)).toBe("2026-03-11T17:36:07Z");
    const oldUtcBytes = new Uint8Array([0x17, 0x0d, ...new TextEncoder().encode("991231235959Z")]);
    const oldUtcNode = __x509Internal.parseAsn1Node(oldUtcBytes, 0)!;
    expect(__x509Internal.decodeAsn1Time(oldUtcBytes, oldUtcNode)).toBe("1999-12-31T23:59:59Z");
    const generalizedBytes = new Uint8Array([0x18, 0x0f, ...new TextEncoder().encode("20260311173607Z")]);
    const generalizedNode = __x509Internal.parseAsn1Node(generalizedBytes, 0)!;
    expect(__x509Internal.decodeAsn1Time(generalizedBytes, generalizedNode)).toBe("2026-03-11T17:36:07Z");
    const badUtcBytes = new Uint8Array([0x17, 0x03, 0x61, 0x62, 0x63]);
    const badUtcNode = __x509Internal.parseAsn1Node(badUtcBytes, 0)!;
    expect(__x509Internal.decodeAsn1Time(badUtcBytes, badUtcNode)).toBeNull();
    const ia5TimeBytes = new Uint8Array([0x16, 0x03, 0x61, 0x62, 0x63]);
    const ia5TimeNode = __x509Internal.parseAsn1Node(ia5TimeBytes, 0)!;
    expect(__x509Internal.decodeAsn1Time(ia5TimeBytes, ia5TimeNode)).toBeNull();
    expect(__x509Internal.decodeAsn1Time(new Uint8Array([0x01, 0x00]), __x509Internal.parseAsn1Node(new Uint8Array([0x01, 0x00]), 0)!)).toBeNull();
    const generalizedBadBytes = new Uint8Array([0x18, 0x03, 0x61, 0x62, 0x63]);
    const generalizedBadNode = __x509Internal.parseAsn1Node(generalizedBadBytes, 0)!;
    expect(__x509Internal.decodeAsn1Time(generalizedBadBytes, generalizedBadNode)).toBeNull();
    const intBytes = new Uint8Array([0x02, 0x03, 0x00, 0x01, 0x02]);
    const intNode = __x509Internal.parseAsn1Node(intBytes, 0)!;
    expect(__x509Internal.decodeAsn1IntegerHex(intBytes, intNode)).toBe("0102");
    const emptyIntBytes = new Uint8Array([0x02, 0x00]);
    const emptyIntNode = __x509Internal.parseAsn1Node(emptyIntBytes, 0)!;
    expect(__x509Internal.decodeAsn1IntegerHex(emptyIntBytes, emptyIntNode)).toBeNull();
    expect(__x509Internal.decodeAsn1IntegerHex(new Uint8Array([0x05, 0x00]), unknownNode)).toBeNull();
    const nameBytes = new Uint8Array([
      0x30, 0x0f, 0x31, 0x0d, 0x30, 0x0b, 0x06, 0x03, 0x55, 0x04, 0x03, 0x13, 0x04,
      0x64, 0x65, 0x6d, 0x6f
    ]);
    const nameNode = __x509Internal.parseAsn1Node(nameBytes, 0)!;
    expect(__x509Internal.parseX509Name(nameBytes, nameNode)).toBe("CN=demo");
    const malformedNameBytes = seq(set(seq(oid(0x55, 0x04, 0x03))));
    expect(__x509Internal.parseX509Name(malformedNameBytes, __x509Internal.parseAsn1Node(malformedNameBytes, 0)!)).toBeNull();
    const unknownOidNameBytes = seq(set(seq(oid(0x2b, 0x06, 0x01), printable("demo"))));
    expect(__x509Internal.parseX509Name(unknownOidNameBytes, __x509Internal.parseAsn1Node(unknownOidNameBytes, 0)!)).toBe("OID=demo");
    const nullValueNameBytes = seq(set(seq(oid(0x55, 0x04, 0x03), der(0x05))));
    expect(__x509Internal.parseX509Name(nullValueNameBytes, __x509Internal.parseAsn1Node(nullValueNameBytes, 0)!)).toBeNull();
    expect(parseX509CertificateBytes(certBytes).subject).toBe("CN=cybermasterchef.local, O=CyberMasterChef, C=PL");
    expect(parseX509CertificateBytes(parseX509Input(TEST_LEAF_CERT_PEM, "CERTIFICATE")).selfIssued).toBe(false);
    expect(parseX509CrlBytes(crlBytes).issuer).toBe("CN=CyberMasterChef CA, O=CyberMasterChef, C=PL");
    const minimalCertBytes = seq(
      seq(
        integer(0x01),
        seq(),
        seq(),
        seq(),
        seq(),
        seq()
      ),
      seq(),
      der(0x03, new Uint8Array([0x00]))
    );
    expect(parseX509CertificateBytes(minimalCertBytes)).toEqual({
      subject: null,
      issuer: null,
      serialNumber: "01",
      validFrom: null,
      validTo: null,
      selfIssued: null
    });
    const shortCertBytes = seq(seq(integer(0x01)), seq(), der(0x03, new Uint8Array([0x00])));
    expect(() => parseX509CertificateBytes(shortCertBytes)).toThrow("Invalid X.509 certificate");
    const minimalCrlBytes = seq(
      seq(
        seq(),
        seq(),
        utcTime("260311173607Z"),
        utcTime("260411173607Z"),
        seq(seq(), seq())
      ),
      seq(),
      der(0x03, new Uint8Array([0x00]))
    );
    expect(parseX509CrlBytes(minimalCrlBytes)).toEqual({
      issuer: null,
      thisUpdate: "2026-03-11T17:36:07Z",
      nextUpdate: "2026-04-11T17:36:07Z",
      revokedCertificates: 2
    });
    const shortCrlBytes = seq(seq(seq(), seq(), utcTime("260311173607Z")), seq(), der(0x03, new Uint8Array([0x00])));
    expect(() => parseX509CrlBytes(shortCrlBytes)).toThrow("Invalid X.509 CRL");
    expect(() => parseX509CertificateBytes(new Uint8Array([0x31, 0x00]))).toThrow("Invalid X.509 certificate");
    expect(() => parseX509CertificateBytes(new Uint8Array([0x30, 0x00]))).toThrow("Invalid X.509 certificate");
    expect(() => parseX509CrlBytes(new Uint8Array([0x31, 0x00]))).toThrow("Invalid X.509 CRL");
    expect(() => parseX509CrlBytes(new Uint8Array([0x30, 0x00]))).toThrow("Invalid X.509 CRL");
    expect(() =>
      parseX509Certificate.run({ input: { type: "json", value: {} } as never, args: {} })
    ).toThrow("Expected bytes or string input");
    expect(() =>
      parseX509Crl.run({ input: { type: "json", value: {} } as never, args: {} })
    ).toThrow("Expected bytes or string input");
  });
});
