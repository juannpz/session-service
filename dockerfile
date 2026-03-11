FROM denoland/deno

# Instalar netcat
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar código, .env y script
COPY . .
COPY .env .
COPY wait-for.sh .

RUN chmod +x ./wait-for.sh
RUN deno cache index.ts

# Exponer puerto que usa el servicio (ajustar si es necesario)
EXPOSE 3000

# CMD limpio usando un solo wait-for.sh para todos los servicios
CMD ["./wait-for.sh", "--", "deno", "run", "--allow-all", "index.ts"]