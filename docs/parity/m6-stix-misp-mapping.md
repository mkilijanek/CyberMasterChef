# M6 STIX/MISP Mapping

Status: in progress

This document defines deterministic mapping from `forensic.basicTriage` IOC fields to export artifacts.

## STIX 2.1 bundle mapping

- `iocs.urls[]` -> `indicator` with pattern `[url:value = '<value>']`
- `iocs.domains[]` -> `indicator` with pattern `[domain-name:value = '<value>']`
- `iocs.ipv4[]` -> `indicator` with pattern `[ipv4-addr:value = '<value>']`
- `iocs.ipv6[]` -> `indicator` with pattern `[ipv6-addr:value = '<value>']`
- `iocs.emails[]` -> `indicator` with pattern `[email-addr:value = '<value>']`
- `iocs.cves[]` -> `indicator` with pattern `[vulnerability:name = '<value>']`

Determinism rules:
- `bundle.id` and `indicator.id` are generated via stable non-random hash.
- `created`, `modified`, `valid_from` use fixed epoch for reproducibility.

## MISP event mapping

- `urls` -> `type: url`, `category: Network activity`
- `domains` -> `type: domain`, `category: Network activity`
- `ipv4/ipv6` -> `type: ip-dst`, `category: Network activity`
- `emails` -> `type: email-src`, `category: Payload delivery`
- `cves` -> `type: vulnerability`, `category: External analysis`

Event metadata is deterministic (`date: 1970-01-01`) to preserve repeatable snapshots in tests.
