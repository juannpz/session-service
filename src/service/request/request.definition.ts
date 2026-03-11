import { buildVerifySessionRequest } from "./v1/session/verifySession.request.ts";
import { buildCreateSessionRequest } from "./v1/session/createSession.request.ts";
import { ContextVariables, ServerBuilder } from "@juannpz/deno-service-tools";

export interface ExtendedContextVariables extends ContextVariables {}

const sessionRequest = [buildVerifySessionRequest(), buildCreateSessionRequest()];

export function addRequest(server: ServerBuilder<ExtendedContextVariables>) {
    addSessionRequest(server);
}

function addSessionRequest(server: ServerBuilder<ExtendedContextVariables>) {
    server.group("/v1/session", (app) => {
        sessionRequest.forEach(request => {
            request.register(app);
        });
    });
}