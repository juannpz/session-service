import {
    buildRequestResponse,
    getNumericDate,
    JWTManager,
    ResUtil,
    Router,
    safeFetch,
    ValidationResult,
} from "@juannpz/deno-service-tools";
import { ExtendedContextVariables } from "../../request.definition.ts";
import {
    JWT_CONFIG_HEADERS,
    JWTPayload,
    KEY_GENERATION_CONFIG,
} from "../../../service.definition.ts";

import { verify } from "@felix/bcrypt";
import { buildAuthHeaders } from "../../request.util.ts";
import { ServiceTokenProvider } from "../../../manager/serviceAuth/ServiceTokenProvider.ts";
import { SERVICE_CONFIG } from "../../../service.config.ts";

interface Body extends Record<string, unknown> {
    user_id: string;
    role: string;
    public_key: string;
}

interface ApiKey {
    api_key_id: string;
    user_id: string;
    public_key: string;
    private_key: string;
    created_at: Date;
    updated_at: Date;
}

export const createServiceSessionRequest = Router.post<ExtendedContextVariables>("/service/create")
    .describe("Create session request")
    .body<Body>()
    .validateBody(validateBody)
    .withVariables<ExtendedContextVariables>()
    .handler(async (context) => {
        const { user_id, role, public_key } = context.body;

        const verifyCredentialsResult = await verifyCredentials(
            user_id,
            public_key,
            SERVICE_CONFIG.servicesEntrypoints.CRUD_SERVICE,
        );

        if (!verifyCredentialsResult.ok) {
            const response = buildRequestResponse(verifyCredentialsResult);
			response.code = 401;

            return context.c.json(response, response.code);
        }

        const jwtPayload: JWTPayload = {
            userId: user_id,
            role,
            aud: "*",
            exp: getNumericDate(60 * 60),
            iss: "session-service",
            sub: user_id,
        };

        const generateJwtResult = await JWTManager.generate<JWTPayload>(
            JWT_CONFIG_HEADERS,
            jwtPayload,
            KEY_GENERATION_CONFIG,
        );

        if (!generateJwtResult.ok) {
            const response = buildRequestResponse(generateJwtResult);
            response.code = 401;

            return context.c.json(response, response.code);
        }

        return context.c.json({ jwt: generateJwtResult.value, message: "OK" }, 200);
    });

function validateBody(body: Body): ValidationResult {
    if (!body.user_id) {
        return { valid: false, message: 'Missing "user_id" prop in body' };
    }

    if (!body.role) {
        return { valid: false, message: 'Missing "role" prop in body' };
    }

    if (!body.public_key) {
        return { valid: false, message: 'Missing "public_key" prop in body' };
    }

    return { valid: true };
}

async function verifyCredentials(userId: string, publicKey: string, crudServiceEntrypoint: string) {
    const getTokenResult = await ServiceTokenProvider.getValidToken();

    if (!getTokenResult.ok) {
        return getTokenResult;
    }

    const getApiKeyResult = await safeFetch<{ data: ApiKey[] }>(
        fetch(`${crudServiceEntrypoint}/v1/crud/api-key?format=object&user_id=${userId}`, {
            headers: buildAuthHeaders(getTokenResult.value),
        }),
    );

    if (!getApiKeyResult.ok) {
        return getApiKeyResult;
    }

    const apiKey = getApiKeyResult.value.data.at(0);

    if (!apiKey) {
        return ResUtil.Fail("Api key not found");
    }

    const valid = await verify(publicKey, apiKey.public_key);

    if (!valid) return ResUtil.Fail("Invalid public key");

    return ResUtil.Succeed("OK");
}
