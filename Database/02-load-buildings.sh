#!/bin/bash

set -e

echo "Instalando PostgreSQL client..."

apt-get update
apt-get install -y postgresql-client

echo "PostgreSQL client instalado."

echo "Esperando a PostgreSQL..."

until pg_isready -h postgres -p 5432 -U postgres -d catastro; do
    sleep 2
done

echo "PostgreSQL disponible."

DB="PG:dbname=catastro user=postgres password=postgres host=postgres port=5432"

export PGPASSWORD=postgres

PSQL="psql -h postgres -U postgres -d catastro"

FIRST_FILE=true

for file in /data/*.gml; do

    filename=$(basename "$file" .gml)

    municipality=${filename#A.ES.SDGC.BU.}
    municipality=${municipality%.building}

    echo "======================================"
    echo "Archivo: $file"
    echo "Municipio: $municipality"
    echo "======================================"

    if [ "$FIRST_FILE" = true ]; then

        echo "Creando tabla buildings..."

        ogr2ogr \
            -f PostgreSQL \
            "$DB" \
            "$file" \
            -nln buildings \
            -nlt PROMOTE_TO_MULTI \
            -t_srs EPSG:25830 \
            -lco GEOMETRY_NAME=geom

        echo "Añadiendo columnas..."

        $PSQL -c "
            ALTER TABLE buildings
            ADD COLUMN municipality VARCHAR(100),
            ADD COLUMN riesgo VARCHAR(100);
        "

        FIRST_FILE=false

    else

        echo "Añadiendo $file..."

        ogr2ogr \
            -f PostgreSQL \
            "$DB" \
            "$file" \
            -nln buildings \
            -nlt PROMOTE_TO_MULTI \
            -t_srs EPSG:25830 \
            -append

    fi

    echo "Asignando municipio: $municipality"

    $PSQL -c "
        UPDATE buildings
        SET
            municipality = '$municipality',
            riesgo = CASE floor(random() * 4)::int
                WHEN 0 THEN 'nulo'
                WHEN 1 THEN 'bajo'
                WHEN 2 THEN 'medio'
                ELSE 'alto'
            END
        WHERE municipality IS NULL;
    "

done

echo "Creando índices..."

$PSQL -c "
    CREATE INDEX IF NOT EXISTS buildings_geom_idx
    ON buildings USING GIST (geom);

    CREATE INDEX IF NOT EXISTS buildings_municipality_idx
    ON buildings(municipality);

    CREATE INDEX IF NOT EXISTS buildings_riesgo_idx
    ON buildings(riesgo);
"

echo "======================================"
echo "✓ Todos los datos cargados correctamente"
echo "======================================"