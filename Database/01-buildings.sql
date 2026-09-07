CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS buildings (
    id BIGSERIAL PRIMARY KEY,
    cadastral_id VARCHAR(100),
    municipality VARCHAR(100),
    province VARCHAR(100),
    area_m2 DOUBLE PRECISION,
    geom geometry(MultiPolygon, 25830)
);

CREATE INDEX IF NOT EXISTS buildings_geom_idx
ON buildings
USING GIST (geom);

CREATE INDEX IF NOT EXISTS buildings_cadastral_id_idx
ON buildings(cadastral_id);
