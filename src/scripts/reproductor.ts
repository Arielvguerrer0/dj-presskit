// Reproductor propio: maneja el reproductor oculto de SoundCloud con su API y pinta la lista con los colores de la marca.
type Sonido = {
  id: number;
  title?: string;
  duration?: number;
  artwork_url?: string | null;
  user?: { username: string; avatar_url?: string };
};

type Widget = {
  bind: (evento: string, accion: (datos?: { relativePosition: number; currentPosition: number }) => void) => void;
  getSounds: (accion: (sonidos: Sonido[]) => void) => void;
  getCurrentSoundIndex: (accion: (indice: number) => void) => void;
  skip: (indice: number) => void;
  toggle: () => void;
  play: () => void;
  seekTo: (ms: number) => void;
};

declare global {
  interface Window {
    SC?: { Widget: ((marco: HTMLIFrameElement) => Widget) & { Events: Record<string, string> } };
  }
}

const tiempo = (ms = 0) => {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const resto = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${resto}` : `${m}:${resto}`;
};

const portada = (sonido?: Sonido) => (sonido?.artwork_url ?? sonido?.user?.avatar_url ?? '').replace('-large.', '-t300x300.');

export function iniciarReproductor() {
  const raiz = document.querySelector<HTMLElement>('[data-reproductor]');
  if (!raiz) return;

  const $ = <T extends Element>(selector: string) => raiz.querySelector<T>(selector)!;
  const marco = $<HTMLIFrameElement>('iframe');
  const imagen = $<HTMLImageElement>('[data-portada]');
  const titulo = $<HTMLElement>('[data-titulo]');
  const boton = $<HTMLButtonElement>('[data-boton]');
  const barra = $<HTMLInputElement>('[data-barra]');
  const actual = $<HTMLElement>('[data-actual]');
  const total = $<HTMLElement>('[data-total]');
  const lista = $<HTMLOListElement>('[data-lista]');
  const plantilla = $<HTMLTemplateElement>('[data-plantilla]');

  let sonidos: Sonido[] = [];
  let indice = 0;
  let arrastrando = false;
  let widget: Widget | undefined;

  const fallar = () => {
    if (raiz.dataset.estado !== 'cargando') return;
    raiz.dataset.estado = 'error';
    $<HTMLElement>('[data-error]').hidden = false;
  };

  const nombre = (sonido?: Sonido) => {
    const autor = sonido?.user?.username;
    const texto = sonido?.title ?? '';
    return autor && texto.startsWith(`${autor} - `) ? texto.slice(autor.length + 3) : texto;
  };

  const mostrar = (nuevo: number) => {
    indice = nuevo;
    const sonido = sonidos[indice];
    titulo.textContent = nombre(sonido);
    total.textContent = tiempo(sonido?.duration);
    const url = portada(sonido);
    if (url) imagen.src = url;
    lista.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-current', String(i === indice)));
  };

  const pintarLista = () => {
    lista.replaceChildren(
      ...sonidos.slice(0, 5).map((sonido, i) => {
        const fila = plantilla.content.firstElementChild!.cloneNode(true) as HTMLElement;
        fila.querySelector('[data-numero]')!.textContent = String(i + 1).padStart(2, '0');
        fila.querySelector('[data-nombre]')!.textContent = nombre(sonido);
        fila.querySelector('[data-duracion]')!.textContent = tiempo(sonido.duration);
        fila.querySelector('button')!.addEventListener('click', () => {
          if (i === indice) widget?.toggle();
          else widget?.skip(i);
        });
        return fila;
      }),
    );
  };

  // Con un perfil, SoundCloud entrega primero solo los id y completa los datos poco después.
  const pedirSonidos = (intento: number) => {
    widget?.getSounds((recibidos) => {
      const completos = recibidos.length > 0 && recibidos.slice(0, 5).every((s) => s.title);
      if (!completos && intento < 20) {
        setTimeout(() => pedirSonidos(intento + 1), 400);
        return;
      }
      sonidos = recibidos.filter((s) => s.title);
      if (!sonidos.length) return fallar();
      raiz.dataset.estado = 'listo';
      boton.disabled = false;
      barra.disabled = false;
      pintarLista();
      mostrar(0);
    });
  };

  const conectar = () => {
    if (!window.SC) return fallar();
    const { Events } = window.SC.Widget;
    widget = window.SC.Widget(marco);
    widget.bind(Events.READY, () => pedirSonidos(0));
    widget.bind(Events.PLAY, () => {
      raiz.dataset.sonando = 'true';
      boton.setAttribute('aria-label', 'Pausar');
      widget?.getCurrentSoundIndex((i) => i !== indice && mostrar(i));
    });
    widget.bind(Events.PAUSE, () => {
      delete raiz.dataset.sonando;
      boton.setAttribute('aria-label', 'Reproducir');
    });
    widget.bind(Events.FINISH, () => delete raiz.dataset.sonando);
    widget.bind(Events.PLAY_PROGRESS, (datos) => {
      if (!datos || arrastrando) return;
      barra.value = String(Math.round(datos.relativePosition * 1000));
      actual.textContent = tiempo(datos.currentPosition);
    });
  };

  boton.addEventListener('click', () => widget?.toggle());
  barra.addEventListener('input', () => {
    arrastrando = true;
    actual.textContent = tiempo(((sonidos[indice]?.duration ?? 0) * Number(barra.value)) / 1000);
  });
  barra.addEventListener('change', () => {
    arrastrando = false;
    widget?.seekTo(((sonidos[indice]?.duration ?? 0) * Number(barra.value)) / 1000);
  });

  // SoundCloud se carga recién cuando la sección Música está por aparecer.
  const cerca = new IntersectionObserver(
    (entradas) => {
      if (!entradas.some((e) => e.isIntersecting)) return;
      cerca.disconnect();
      marco.src = marco.dataset.src ?? '';
      const script = document.createElement('script');
      script.src = 'https://w.soundcloud.com/player/api.js';
      script.onload = conectar;
      script.onerror = fallar;
      document.head.append(script);
      setTimeout(fallar, 15000);
    },
    { rootMargin: '100% 0px' },
  );
  cerca.observe(raiz.closest('[data-show]') ?? raiz);
}
