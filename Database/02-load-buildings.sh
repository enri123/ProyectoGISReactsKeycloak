#!/bin/bash

set -e # Hace que el script termine inmediatamente si una orden falla.

echo "Cargando datos de edificios desde GML..."

echo "Esperando a PostgreSQL..."

until python3 -c "import socket; s=socket.socket(); s.settimeout(1); s.connect(('postgres', 5432)); s.close()" 2>/dev/null; do # Repite la comprobación hasta que PostgreSQL acepte conexiones en el puerto 5432.
    echo "Esperando a PostgreSQL..."
    sleep 2 # Espera dos segundos antes de volver a comprobar, evitando consultas continuas.
done

echo "PostgreSQL está disponible."

for file in /data/*.gml; do # Recorre todos los archivos con extensión .gml ubicados en /data.

    echo "Cargando: $file"

    filename=$(basename "$file" .gml) # Obtiene solo el nombre del archivo y elimina la extensión .gml.
    municipality=${filename#A.ES.SDGC.BU.} # Elimina del principio del nombre el prefijo estándar del Catastro.
    municipality=${municipality%.building} # Elimina del final el sufijo .building para obtener el municipio.
    municipality_sql=${municipality//\'/\'\'} # Duplica las comillas simples para que el municipio sea seguro dentro de SQL.

    echo "Municipio detectado: $municipality"


# Ejecuta la importación de datos geoespaciales usando la herramienta GDAL ogr2ogr.
# Selecciona PostgreSQL como formato de destino.
# Define la conexión a la base de datos catastro.
# Indica el archivo GML actual como fuente de datos.
# Selecciona Building, añade el municipio y genera una clasificación aleatoria para cada fila usando SQLite.
# Guarda los datos en la tabla de destino llamada buildings.
# Convierte geometrías simples en multiparte cuando sea necesario.
# Reproyecta las geometrías al sistema de coordenadas ETRS89 / UTM zona 30N.
# Añade los registros a la tabla existente sin reemplazar los datos cargados anteriormente.
    ogr2ogr \
        -f PostgreSQL \
        "PG:dbname=catastro user=postgres password=postgres host=postgres port=5432" \
        "$file" \
        -dialect SQLITE \
        -sql "SELECT *, '$municipality_sql' AS municipality, CASE abs(random() % 4) WHEN 0 THEN 'nulo' WHEN 1 THEN 'bajo' WHEN 2 THEN 'medio' WHEN 3 THEN 'alto' END AS riesgo FROM Building" \
        -nln buildings \
        -nlt PROMOTE_TO_MULTI \
        -t_srs EPSG:25830 \
        -append

done

echo "✓ Todos los datos de edificios cargados correctamente"