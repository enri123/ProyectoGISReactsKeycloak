CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS buildings (
    id BIGSERIAL PRIMARY KEY,
    municipality VARCHAR(100),
    riesgo VARCHAR(100),
    geom geometry(MultiPolygon, 25830)
);

CREATE INDEX IF NOT EXISTS buildings_geom_idx
ON buildings
USING GIST (geom);

CREATE INDEX IF NOT EXISTS buildings_municipality_idx
ON buildings(municipality);
