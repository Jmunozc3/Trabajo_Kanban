# Usa la imagen oficial de Deno
FROM denoland/deno:alpine-1.40.3

# Establece el directorio de trabajo
WORKDIR /app

# Copia todos los archivos del proyecto al contenedor
COPY . .

# Expone el puerto que usa Fresh por defecto
EXPOSE 8000

# Arranca tu servidor Fresh
CMD ["run", "--allow-net", "--allow-env", "--allow-read", "Proyecto_Practicas/main.ts"]

