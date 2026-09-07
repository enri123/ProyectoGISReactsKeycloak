#!/bin/bash

set -e

echo "Cargando datos de edificios desde GML..."

echo "Esperando a PostgreSQL..."

until python3 -c "import socket; s=socket.socket(); s.settimeout(1); s.connect(('postgres', 5432)); s.close()" 2>/dev/null; do
    echo "Esperando a PostgreSQL..."
    sleep 2
done

echo "PostgreSQL está disponible."

FIRST=true

for file in /data/*.gml; do

    echo "Cargando: $file"

    if [ "$FIRST" = true ]; then

        ogr2ogr \
            -f PostgreSQL \
            "PG:dbname=catastro user=postgres password=postgres host=postgres port=5432" \
            "$file" \
            -nln buildings \
            -nlt PROMOTE_TO_MULTI

        FIRST=false

    else

        ogr2ogr \
            -f PostgreSQL \
            "PG:dbname=catastro user=postgres password=postgres host=postgres port=5432" \
            "$file" \
            -nln buildings \
            -nlt PROMOTE_TO_MULTI \
            -append

    fi

done

echo "✓ Todos los datos de edificios cargados correctamente"