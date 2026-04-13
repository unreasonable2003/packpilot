# PackPilot

PackPilot is a VS Code extension for discovering and installing packages from the current development workspace.

## MVP Scope

- Search `npm` packages by name or by describing what you need
- Show package metadata, trust signals, and version options
- Install the selected package safely into the current workspace
- Keep AI assistance optional and explainable

## Why this repo exists

This repository is the local foundation for the first production MVP:

- extension UI
- search orchestration
- local install agent
- future backend and AI integration

## Local Development

This repo is scaffolded for a TypeScript-based VS Code extension.

Planned commands:

- `npm install`
- `npm run build`
- `npm run watch`

## Main Files

- `src/extension.ts` - extension entry point
- `src/search.ts` - package search orchestration
- `src/agent.ts` - local install execution
- `src/types.ts` - shared types
- `first-mvp-lld.md` - design doc for the MVP

## Notes

The current scaffold is intentionally minimal so we can harden it step by step without losing the production-grade shape.
