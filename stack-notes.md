# Dependency and environment notes

The requested application stack was kept pinned without version ranges wherever the requested release exists. Four requested releases had to be adjusted to satisfy the explicit clean-install and zero-high-or-critical-audit requirements:

| Requested | Installed | Reason |
| --- | --- | --- |
| `@vercel/blob@0.29.4` | `2.8.2` | `0.29.4` is not published in the npm registry. The available older Blob SDK line did not expose private storage in its TypeScript API, while prescription documents require private access. The installed SDK supports private blobs and passed the audit. |
| `next-auth@5.0.0-beta.28` | `5.0.0-beta.32` | The requested beta is affected by critical advisories. Beta 32 is the patched release selected by npm audit. |
| `jspdf@3.0.1` | `4.2.1` | The requested release has critical advisories. Version 4.2.1 is the patched release selected by npm audit. |
| `nodemailer@6.10.1` | `10.1.7` | The requested release has high severity advisories. Version 10.1.7 is the patched release selected by npm audit. |

`motion-dom` and `motion-utils` are pinned at `12.18.1` in `overrides` because the exact requested Framer Motion release otherwise resolved newer incompatible internal motion packages during a Next 16.4.2 Turbopack build.

`.npmrc` enables legacy peer resolution because the requested NextAuth beta advertises a Next 14/15 peer range even though the project is pinned to Next 16.4.2. The production build passes with this compatibility setting.

The repository environment currently exposes Node 22.22.3. The project still declares the requested `node >=24.0.0` engine and `.nvmrc` value `24`; npm reports an engine warning in this environment. `npm ci`, TypeScript, the Next production build, and the high-severity audit all completed successfully here.
