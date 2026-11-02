// Este es el único archivo que hay que rellenar. Lo que quede vacío se avisa en desarrollo y no se publica.

/** Dirección de un archivo de public/, con la subcarpeta donde se publique el sitio. */
export const ruta = (archivo: string) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${archivo}`;

export type Enlace = { titulo: string; url: string };
export type Fecha = { fecha: string; lugar: string; ciudad: string };
export type Descarga = { titulo: string; detalle: string; url: string };

export const artista = {
  nombre: 'Ariel Guerrero',
  genero: 'Tech House · Deep · Progressive',
  ciudad: 'Santiago de Chile',
  // Un párrafo por línea.
  bio: [
    'Ariel Guerrero es un DJ de 29 años nacido en Santiago de Chile. Su conexión con la música empezó desde muy chico: a los 12 años ya tocaba la guitarra en grupos folclóricos. Sin embargo, hubo un momento que lo cambió todo: recuerda perfectamente la primera vez que vio y escuchó a Michael Jackson. El sonido del bajo, el baile y la puesta en escena lo marcaron por completo y despertaron su fascinación por el ritmo.',
    'El 2023 fue un año clave para él. Después de asistir a varios eventos de música electrónica y sentir la vibra de la pista, decidió dar el paso hacia la cabina y aprender a mezclar. Desde ese momento, se ha dedicado a pulir su técnica y a buscar ese sonido que realmente lo defina.',
    'La misión de Ariel es que la gente conecte con la música y logre sentir la misma emoción que él experimenta cuando toca. Moviéndose fluidamente entre el House, el Deep y el Tech House, sus sets están llenos de energía y alegría, destacando siempre un groove juguetón que se genera al mezclar buenos bajos con percusiones. Para él, tocar no es solo poner música, es compartir lo que ama y hacer que la pista disfrute con él.',
  ],
  email: 'arielguerreromusic@gmail.com',
  // Ejemplo: { titulo: 'Sesión de primavera', url: 'https://soundcloud.com/...' }
  mixes: [{ titulo: 'Escuchar en SoundCloud', url: 'https://soundcloud.com/arielvguerrero' }] as Enlace[],
  redes: [
    { titulo: 'SoundCloud', url: 'https://soundcloud.com/arielvguerrero' },
    { titulo: 'Instagram', url: 'https://www.instagram.com/arielguerrerodj' },
  ] as Enlace[],
  // Ejemplo: { fecha: '14 mar 2027', lugar: 'Nombre del club', ciudad: 'Madrid' }
  fechas: [] as Fecha[],
  // Ejemplo: 'Dos reproductores CDJ 3000 y mezclador DJM 900'
  tecnica: [] as string[],
  // Los archivos van en public/descargas. Ejemplo: { titulo: 'Fotos', detalle: 'ZIP, 40 MB', url: '/descargas/fotos.zip' }
  descargas: [
    { titulo: 'Logo', detalle: 'SVG', url: ruta('descargas/ariel-guerrero-5b-positivo.svg') },
    { titulo: 'Logo', detalle: 'PNG transparente, 4000 px', url: ruta('descargas/ariel-guerrero-5b-positivo-4000.png') },
  ] as Descarga[],
};

export const frase = 'Todo lo que necesitas para programarme,\nreunido en una sola página.';

export type EscenaId = 'musica' | 'fechas' | 'tecnica';
export type Escena = {
  id: EscenaId;
  etiqueta: string;
  /** Clip sin audio en public/media. El scroll lo hace avanzar y retroceder. */
  video?: string;
  /** Imagen en public/media. Se ve mientras carga el clip, o sola si no hay clip. */
  imagen?: string;
  /** Descripción de la imagen. */
  alt?: string;
};

const escenas: Escena[] = [
  { id: 'musica', etiqueta: 'Música' },
  { id: 'fechas', etiqueta: 'Fechas' },
  { id: 'tecnica', etiqueta: 'Técnica' },
];

const tieneDatos: Record<EscenaId, boolean> = {
  musica: artista.mixes.length > 0,
  fechas: artista.fechas.length > 0,
  tecnica: artista.tecnica.length > 0,
};

// En desarrollo se ven todas para poder revisar el diseño. Al publicar, solo las que tienen contenido.
export const escenasVisibles = import.meta.env.DEV ? escenas : escenas.filter((escena) => tieneDatos[escena.id]);

export const faltan = [
  artista.nombre === 'Tu nombre de DJ' && 'nombre',
  !artista.genero && 'género',
  !artista.ciudad && 'ciudad',
  !artista.bio.length && 'bio',
  !artista.email && 'email de contratación',
  !artista.mixes.length && 'mixes',
  !artista.redes.length && 'redes',
  !artista.fechas.length && 'fechas',
  !artista.tecnica.length && 'datos técnicos',
  !artista.descargas.length && 'descargas',
].filter((campo): campo is string => Boolean(campo));
