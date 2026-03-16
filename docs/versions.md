# Version Policy

Pinned majors for the initial modernization scaffold.

| Component | Version policy |
| --- | --- |
| Node.js | 22 LTS |
| pnpm | 10.x |
| TypeScript | 5.8 |
| React | 19.x |
| React Native / Expo | Expo SDK 53 / React Native current stable |
| NestJS | 11.x |
| PostgreSQL | 17 |
| Redis | 8 |
| OpenSearch | 3 |
| MinIO | latest stable release |

## Upgrade cadence

- Weekly dependency update PRs via Renovate.
- Quarterly review for major-version and EOL risk.
- No runtime or framework may be EOL at release time.