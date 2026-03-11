import { AuthConfig, ServiceConfig } from "./service.definition.ts";
import { checkEnv } from "@juannpz/deno-service-tools";

export function getConfig() {
    const config: ServiceConfig = {
        authConfig: getAuthConfig(),
    };

    return checkEnv(config);
}

function getAuthConfig(): AuthConfig {
    return {
        JWT_KEY: Deno.env.get("JWT_KEY") ?? ""
    };
}