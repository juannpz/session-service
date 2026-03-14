import { addRequest, ExtendedContextVariables } from "./request/request.definition.ts";
import { createServer } from "@juannpz/deno-service-tools";
import { initManager } from "./manager/init.ts";
import { SERVICE_CONFIG } from "./service.config.ts";

const server = createServer<ExtendedContextVariables>({
    port: 3001,
});

export function init() {
    initManager(SERVICE_CONFIG);

    addRequest(server);

    server.start();
}
