import { JWTPayload, KEY_GENERATION_CONFIG } from "../../../service.definition.ts";
import { JWTManager, Router, ValidationResult } from "@juannpz/deno-service-tools";
import { ExtendedContextVariables } from "../../request.definition.ts";

interface Body extends Record<string, unknown> {
	jwt: string;
}

export function buildVerifySessionRequest() {
	return (
		Router.post<ExtendedContextVariables>("/verify")
		.describe("Verify session request")
		.body<Body>()
		.validateBody(validateBody)
		.withVariables<ExtendedContextVariables>()
		.handler(async (context) => {
			const { jwt } = context.body;

			const verifyJwtResult = await JWTManager.verify<JWTPayload>(jwt, KEY_GENERATION_CONFIG);

			if (!verifyJwtResult.ok)
				return context.c.json({
					message: verifyJwtResult.message,
					error: verifyJwtResult.error
				}, 401);

			return context.c.json({ valid: true, message: "OK" }, 200);
		})
	);
}

function validateBody(body: Body): ValidationResult {
    if (!body.jwt)
		return { valid: false, message: 'Missing "jwt" prop in body' };

    return { valid: true };
}