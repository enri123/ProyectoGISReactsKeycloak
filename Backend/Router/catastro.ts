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

  app.get('/buildings', async (request, reply) => {
    try {
      console.log(`Entra en la api de catastro`);

    const result = await db.query(`
        SELECT
            id,
            cadastral_id,
            ST_AsGeoJSON(
                ST_Transform(geom, 4326)
            )::json AS geometry
        FROM buildings
    `);
      console.log(`result: ${result.rows.length} rows`);

      const features = result.rows.map((row) => ({
        type: 'Feature',
        geometry: row.geometry,
        properties: {
          id: row.id,
          cadastral_id: row.cadastral_id,
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
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connection...');
  await db.end();
  process.exit(0);
});
