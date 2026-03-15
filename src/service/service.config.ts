import {
    AuthConfig,
    NetworkConfig,
    ServiceAuthConfig,
    ServiceConfig,
    ServicesEntrypoints,
} from "./service.definition.ts";
import { checkEnv } from "@juannpz/deno-service-tools";

function getConfig() {
    const config: ServiceConfig = {
        authConfig: getAuthConfig(),
        sessionAuthConfig: getServiceAuthConfig(),
        servicesEntrypoints: getServicesEntrypoints(),
		networkConfig: getNetworkConfig()
    };

    return checkEnv(config);
}

function getAuthConfig(): AuthConfig {
    return {
        JWT_KEY: Deno.env.get("JWT_KEY") ?? "",
    };
}

function getServiceAuthConfig(): ServiceAuthConfig {
    return {
        SERVICE_AUTH_USER_ID: Deno.env.get("SERVICE_AUTH_USER_ID") ?? "",
        SERVICE_AUTH_ROLE: Deno.env.get("SERVICE_AUTH_ROLE") ?? "",
        SERVICE_AUTH_AUD: Deno.env.get("SERVICE_AUTH_AUD") ?? "",
        SERVICE_AUTH_SUB: Deno.env.get("SERVICE_AUTH_SUB") ?? "",
    };
}

function getServicesEntrypoints(): ServicesEntrypoints {
    return {
        CRUD_SERVICE: Deno.env.get("CRUD_SERVICE") ?? "",
    };
}

function getNetworkConfig(): NetworkConfig {
	return {
		PORT: Deno.env.get("PORT") ?? ""
	}
}

export const SERVICE_CONFIG = getConfig();
