import { addRequest, ExtendedContextVariables } from "./request/request.definition.ts";
import { createServer } from "@juannpz/deno-service-tools";
import { initManager } from "./manager/init.ts";
import { getConfig } from "./service.config.ts";

const server = createServer<ExtendedContextVariables>({
    port: 3001,
});

export function init() {
    const config = getConfig();

    initManager(config);

    addRequest(server);

    server.start();
}
