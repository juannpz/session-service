import { VerifySessionRequestBody } from "./v1/session/verify/verifySessionRequest.types.ts";
import { ExtendedContextVariables } from "../../request/request.definition.ts";
import { Route } from "@juannpz/deno-service-tools";

export type VeryfySessionRequest = Route<Record<string, string>, Record<string, unknown> & Record<"format", string>, Record<string, unknown>, Record<string, string> & Record<"Authorization", unknown>, ExtendedContextVariables>