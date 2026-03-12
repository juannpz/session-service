import { ServiceConfig } from "../service.definition.ts";
import { JWTManager } from "@juannpz/deno-service-tools";
import { ServiceTokenProvider } from "./serviceAuth/ServiceTokenProvider.ts";

export async function initManager(config: ServiceConfig) {
    JWTManager.init(config.authConfig.JWT_KEY);

    const initResult = await ServiceTokenProvider.init(config.sessionAuthConfig);

    if (!initResult.ok) throw new Error(initResult.message);
}
