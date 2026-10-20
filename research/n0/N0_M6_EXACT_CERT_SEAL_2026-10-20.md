# N0 — M6 exact-certification seal

This file records the completed independent comparison for the preregistered m=6 census.

## Status

- `M_6 = 20`: **Certificado exacto** (finite exhaustive domain, two independent implementations, exact comparison).
- `BRIDGE-SLACK-P1` for `m=6`: **Certificado exacto** (finite exhaustive domain, two independent implementations, exact comparison).
- Universal BRIDGE-SLACK and `M_m = 3m+2` for all `m`: **not proved by this finite certification**.

## Preregistered implementation hashes

V2 preregistration:
`c425b2959fdab0b499422997257408158f90189f5271a0bf967b082f6a3cbc8c`

ChatGPT source:
`d0f1d642b8fa2e2fe5426969e1fdcc33fe019548b2721e05d7db8072aaf9f7c4`

Claude source:
`14dfcef8b434baa471b2bc653fcd911ae0a86fc6a6a4d85219cf08519ba8d6a2`

Claude pre-census manifest:
`b940966774c77ae9e106faa7a22e0bb68c572e08dd8f32821874fe8af8332e00`

## Output hashes

ChatGPT/Mati run ZIP `salida_m6_gpt.zip`:
`79bec48f62b58a003cd2bf364eca625b3b2079282d0318fc65e1aa8c198b12fb`

Claude result package:
`68ecec4e08eca763dbf122f70851c2a1e595f31a1ded619c7247f838a8b02e03`

Claude aggregate result:
`5715bb3c7dbc03a7728c2188bd421772a0756e501075278220721da66f290c86`

Claude rho=20 word list:
`5458b8a1bcee93b7b2581512242c94ffad3d566b15797ef179714ed31347b623`

## Exact comparison report

`N0_M6_EXACT_CERT_COMPARISON_2026-10-20.md`

SHA-256:
`86aa0d75fcfa0dfa5d7dab1abe2d067e8c178c8ddbdf72c56362211b117fb67d`

Comparison-report ZIP SHA-256:
`65a3b36fa497e2ec6f706328a8c0a763cadbb0ade4f4315b9d768878079cb5df`

## Exact agreement

Both implementations agree exactly on:

- total: `137438953472 = 2^37`
- `rho_max = 20`
- exactly `52` words with `rho=20`
- `0` words with `rho>=21`
- P1 sector size: `173814248`
- P1 maximum rho: `19`
- P1 violations: `0`
- all 20 rows of the complete rho histogram
- all 208 nonzero `(delta,b,rho,count)` P1 rows
- all 52 extremal integer word IDs, in sorted order
- direct DEF-CORE recomputation of bitstring, `rho`, `delta`, `n`, and `b` for all 52 words
- target `b` distribution: `11:4, 12:28, 13:20`
- target `(delta,b)` distribution: `(0,11):4, (1,12):16, (2,12):12, (2,13):12, (3,13):8`

The finite certification does not promote the universal conjecture.