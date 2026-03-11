import { JWT_CONFIG_HEADERS, JWTPayload, KEY_GENERATION_CONFIG } from "../../../service.definition.ts";
import { getNumericDate, JWTManager, Router, ValidationResult } from "@juannpz/deno-service-tools";
import { ExtendedContextVariables } from "../../request.definition.ts";

interface Body extends Record<string, unknown> {
	userId: string;
}

export function buildCreateSessionRequest() {
	return (
		Router.post<ExtendedContextVariables>("/create")
		.describe("Create session request")
		.body<Body>()
		.validateBody(validateBody)
		.withVariables<ExtendedContextVariables>()
		.handler(async (context) => {
			const { userId } = context.body;

			const JWTPayload: JWTPayload = {
				userId,
				aud: "test",
				exp: getNumericDate(60 * 60),
				iss: "test",
				sub: "test"
			}

			const generateJwtResult = await JWTManager.generate<JWTPayload>(JWT_CONFIG_HEADERS, JWTPayload, KEY_GENERATION_CONFIG);

			if (!generateJwtResult.ok)
				return context.c.json({
					message: generateJwtResult.message,
					error: generateJwtResult.error
				}, 400);

			return context.c.json({ jwt: generateJwtResult.value, message: "OK" }, 200);
		})
	);
}

function validateBody(body: Body): ValidationResult {
	if (!body.userId)
		return { valid: false, message: 'Missing "userId" prop in body' };

	return { valid: true };
}