# MyDocs

List of commands to run and execute this project localy. Note that you will need to spawn multiple calimero node for the demo. 

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

4) Generate the TypeScript ABI client (if present)

```bash
pnpm run app:generate-client
```

5) Start the frontend dev server (watching the WASM if configured)

```bash
pnpm run app:dev
```

## Clean commands 

If you run into some disperency between two nodes, it is possible that the node are using different context, which does not sync the doc. In that case, I would recommend to reset your nodes and to clean the created `data` folder.

```bash
docker stop $(docker ps -q)
docker rm $(docker ps -a -q)
docker rmi -f $(docker images -q)
docker volume rm $(docker volume ls -q)
docker network rm $(docker network ls -q)
docker system prune -a --volumes
```

