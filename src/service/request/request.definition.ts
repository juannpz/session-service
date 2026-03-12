import { ContextVariables, ServerBuilder } from "@juannpz/deno-service-tools";
import { verifySessionRequest } from "./v1/session/verifySession.request.ts";
import { createSessionRequest } from "./v1/session/createSession.request.ts";

export interface ExtendedContextVariables extends ContextVariables {}

const sessionRequest = [verifySessionRequest, createSessionRequest];

export function addRequest(server: ServerBuilder<ExtendedContextVariables>) {
    addSessionRequest(server);
}

function addSessionRequest(server: ServerBuilder<ExtendedContextVariables>) {
    server.group("/v1/session", (app) => {
        sessionRequest.forEach((request) => {
            request.register(app);
        });
    });
}
