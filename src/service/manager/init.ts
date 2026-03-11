import { ServiceConfig } from "../service.definition.ts";
import { JWTManager } from "@juannpz/deno-service-tools";

export function initManager(config: ServiceConfig) {
    JWTManager.init(config.authConfig.JWT_KEY);
}