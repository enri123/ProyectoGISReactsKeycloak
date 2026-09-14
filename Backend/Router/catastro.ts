import type { FastifyInstance } from 'fastify';
import 'dotenv/config';
import { Pool } from 'pg';

const db = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'catastro',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

export async function catastroRoutes(app: FastifyInstance) {
  console.log(`Entra en la función de catastro`);

  app.get(
    '/buildings',
    {
      onRequest: [app.authenticate],
    },
    async (request, reply) => {
      console.log(`User roles: ${request.user.realm_access?.roles}`);

      try {
        console.log(`Entra en la api de catastro`);

        let result;

        if (request.user.realm_access?.roles.includes('user_creation')) {
          result = await db.query(`
        SELECT
            ogc_fid,
            informationsystem,
            reference,
            localid,
            documentlink,
          municipality,
          riesgo,
            ST_AsGeoJSON(
                ST_Transform(geom, 4326)
            )::json AS geometry
        FROM buildings
    `);
        } else {
          const municipalityRoles = (request.user.realm_access?.roles ?? [])
            .map((role) => role.trim().toLowerCase())
            .filter(Boolean);

          console.log(`Municipality roles: ${municipalityRoles}`);
          console.log(`Entra en la api de catastro`);

          // 4230
          result = await db.query(
            `
        SELECT
            ogc_fid,
            informationsystem,
            reference,
            localid,
            documentlink,
          municipality,
          riesgo,
            ST_AsGeoJSON(
                ST_Transform(geom, 4326)
            )::json AS geometry
            FROM buildings
            WHERE LOWER(municipality) = ANY($1::text[])
          `,
            [municipalityRoles]
          );
        }

        console.log(`result: ${result.rows.length} rows`);

        const features = result.rows.map((row) => ({
          type: 'Feature',
          geometry: row.geometry,
          properties: {
            ogc_fid: row.ogc_fid,
            informationsystem: row.informationsystem,
            reference: row.reference,
            localid: row.localid,
            documentlink: row.documentlink,

            municipality: row.municipality,
            riesgo: row.riesgo,
          },
        }));
        console.log(`features count: ${features.length}`);

        return {
          type: 'FeatureCollection',
          features,
        };
      } catch (error) {
        console.error('Error al consultar la base de datos:', error);
        reply.code(500).send({
          error: 'Error querying the database',
        });
      }
    }
  );
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connection...');
  await db.end();
  process.exit(0);
});
