import {
    AuthConfig,
    ServiceAuthConfig,
    ServiceConfig,
    ServicesEntrypoints,
} from "./service.definition.ts";
import { checkEnv } from "@juannpz/deno-service-tools";

export function getConfig() {
    const config: ServiceConfig = {
        authConfig: getAuthConfig(),
        sessionAuthConfig: getSessionServiceAuthConfig(),
        servicesEntrypoints: getServicesEntrypoints(),
    };

    return checkEnv(config);
}

function getAuthConfig(): AuthConfig {
    return {
        JWT_KEY: Deno.env.get("JWT_KEY") ?? "",
    };
}

function getSessionServiceAuthConfig(): ServiceAuthConfig {
    return {
        SERVICE_AUTH_AUD: Deno.env.get("SERVICE_AUTH_AUD") ?? "",
        SERVICE_AUTH_ROLE: Deno.env.get("SERVICE_AUTH_ROLE") ?? "",
        SERVICE_AUTH_SUB: Deno.env.get("SERVICE_AUTH_SUB") ?? "",
        SERVICE_AUTH_USER_ID: Deno.env.get("SERVICE_AUTH_USER_ID") ?? "",
    };
}

function getServicesEntrypoints(): ServicesEntrypoints {
    return {
        CRUD_SERVICE: Deno.env.get("CRUD_SERVICE") ?? "",
    };
}
