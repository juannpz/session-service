import { ExtendedContextVariables } from "./request.definition.ts";
import { Context } from "@juannpz/deno-service-tools";

export function buildAuthHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
}

export function reBuildAuthHeaders(req: Request) {
    return { Authorization: req.headers.get("Authorization") };
}

export function getContextVariables(context: Context<{ Variables: ExtendedContextVariables }>): ExtendedContextVariables {
   return context.var;
}