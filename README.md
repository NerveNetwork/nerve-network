# NerveNetwork

### Project setup
```
yarn
```
### Compiles and hot-reloads for development
```angular2html
yarn dev-prod
```
### Compiles and minifies for production
```angular2html
yarn build-prod
```

### Generate RPC URL candidates
```bash
yarn generate:rpc
```

This command updates `src/constants/rpcUrls.generated.json` with filtered EVM RPC candidates.
It excludes common testnet endpoints and validates EVM JSON-RPC compatibility.

Run this command again when:
- adding or removing EVM chains in `src/utils/heterogeneousChainConfig.ts`
- updating chain-specific RPC whitelist rules in `scripts/generate-rpc-urls.mjs`
- refreshing stale RPC candidates after provider outages