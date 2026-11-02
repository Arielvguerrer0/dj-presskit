# Presskit de DJ

Presskit de una sola página. El scroll actúa como el cabezal de un tema: recorre seis escenas, llena la forma de onda y hace avanzar o retroceder los vídeos.

## Puesta en marcha

Necesitas Node.js 22.12 o superior.

```sh
npm install
npm run dev
```

La web queda en `http://localhost:4321`.

## Añadir tu contenido

1. Rellena `src/data/presskit.ts`. Es el único archivo de datos.
2. Copia tus fotos y clips en `public/media/` y añádelos a su escena, en ese mismo archivo:

   ```ts
   { id: 'inicio', etiqueta: 'Inicio', video: '/media/inicio.mp4', imagen: '/media/inicio.jpg', alt: 'Descripción de la foto' },
   ```

3. Copia en `public/descargas/` los archivos del kit de prensa y añádelos a `descargas`.

Mientras falte un dato, en desarrollo se ve un aviso **Falta**. Al publicar, ese aviso desaparece, las escenas vacías no salen y `npm run build` lista lo que queda por rellenar.

## Preparar un clip

Usa planos sin cortes, en horizontal y de unos 8 segundos. Para que el scroll vaya fluido, el vídeo necesita fotogramas clave muy seguidos. Con [ffmpeg](https://ffmpeg.org):

```sh
ffmpeg -i original.mp4 -an -vf "scale=1920:-2" -c:v libx264 -crf 28 -g 6 -pix_fmt yuv420p -movflags +faststart public/media/inicio.mp4
```

Para usar como imagen de carga el primer fotograma del clip:

```sh
ffmpeg -i public/media/inicio.mp4 -frames:v 1 public/media/inicio.jpg
```

## Publicar

En PowerShell:

```powershell
$env:SITE_URL = 'https://tu-dominio.com'; npm run build
```

El resultado es una web estática en `dist/`, que se puede subir a cualquier alojamiento de páginas estáticas.
