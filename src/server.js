import http from "node:http";
import portfinder from "portfinder";

import { app } from "./app.js";

async function startHttpServer() {
  const port = await portfinder.getPortPromise();
  const server = http.createServer(app);
  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
}

await startHttpServer();
