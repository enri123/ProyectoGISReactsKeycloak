import 'dotenv/config';

import Fastify from "fastify";
import cors from "@fastify/cors";

import authPlugin from "./plugins/auth.ts";
import { userRoutes } from "./Router/user.ts";

// Activamos los logs
const app = Fastify({
    logger: true,
});

const port = Number(process.env.PORT) || 3000;

async function main() {
    // Registramos el plugin de CORS para permitir solicitudes desde cualquier origen
    // similar al app.use en express es app.register en fastify
    await app.register(cors, {
        origin: true,
    });

    await app.register(authPlugin);

    await app.register(userRoutes, {
        prefix: "/api/users",
    });

    app.get("/", async () => {
        return "Hello World!";
    });

    await app.listen({
        port,
        host: "127.0.0.1",
    });

    console.log(`Server is running on port ${port}`);
}

main().catch((error) => {
    app.log.error(error);
    process.exit(1);
});