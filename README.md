# PackPilot

PackPilot is a VS Code extension for discovering and installing `npm` packages from the current development workspace.

## What the MVP does

- Search `npm` packages by exact name or natural-language intent
- Load live package metadata from the npm registry
- Show trust signals like repository links, homepage links, publish recency, version history, and weekly downloads
- Install a selected version into the current workspace as either a dependency or dev dependency
- Stream install logs directly inside VS Code

## Current architecture

- `src/extension.ts`
  - VS Code activation entry point
- `src/ui/`
  - panel controller and webview rendering
- `src/services/`
  - npm registry lookup and install services
- `src/workspace/`
  - workspace and package manifest access
- `src/core/`
  - shared HTTP, validation, and error infrastructure
- `src/domain/`
  - message contracts and shared types

## Local Development

1. Run `npm install`
2. Run `npm run build`
3. Open the repo in VS Code
4. Launch the extension host from the Run and Debug panel
5. Execute `PackPilot: Open Package Search`

## MVP Notes

- The search experience is live against the npm registry.
- The install flow is local and constrained to the current workspace.
- The design doc for the original MVP is in [first-mvp-lld.md](./first-mvp-lld.md).
