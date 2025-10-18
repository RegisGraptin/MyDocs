# Battleship (Calimero)

A minimal README with the exact commands to build the Rust backend (WASM), sync the new implementation into the frontend, and run the app locally.

Prerequisites
- Node.js 16+ and pnpm
- Rust 1.70+
- git

Quick commands

1) Install frontend deps

```bash
pnpm run app:install
```


2) Build the Rust backend (WASM)

```bash
pnpm run logic:build
```

3) Sync the built WASM into the frontend app

```bash
pnpm run network:bootstrap
pnpm run logic:sync ./logic/res/kv_store.wasm
```

Notes: the sync command copies the WASM produced by the `logic` build into the `app` code so the frontend can load the updated implementation.

4) Generate the TypeScript ABI client (if present)

```bash
pnpm run app:generate-client
```

5) Start the frontend dev server (watching the WASM if configured)

```bash
pnpm run app:dev
```

Other useful commands

- Build production frontend: `pnpm run app:build`
- Run backend tests: `cd logic && cargo test`
- Generate Rust docs: `cd logic && cargo doc --open`

If any script above is missing, run the equivalent manually:

- Build WASM manually: `cd logic && cargo build --target wasm32-unknown-unknown --release`
- Copy WASM into app: `cp logic/target/wasm32-unknown-unknown/app-release/*.wasm app/public/` (adjust target path as needed)

If you'd like, I can also:
- check that the referenced pnpm scripts exist in `package.json`
- run a quick build and verify the WASM file appears in the expected `logic/target` path

Completion: README simplified and exact sync commands added.


## Docker clean commands

```bash
docker stop $(docker ps -q)
docker rm $(docker ps -a -q)
docker rmi -f $(docker images -q)
docker volume rm $(docker volume ls -q)
docker network rm $(docker network ls -q)
docker system prune -a --volumes
```

