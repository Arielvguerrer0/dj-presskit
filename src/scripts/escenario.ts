import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animarRider } from './rider';
import { iniciarReproductor } from './reproductor';

gsap.registerPlugin(ScrollTrigger);

const calma = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const conexion = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
const sinVideo = calma || Boolean(conexion?.saveData);

let lenis: Lenis | undefined;
if (!calma) {
  lenis = new Lenis({ autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((segundos) => lenis?.raf(segundos * 1000));
  gsap.ticker.lagSmoothing(0);
}

const irA = (y: number) => {
  if (lenis) lenis.scrollTo(y);
  else window.scrollTo(0, y);
};

// Apariciones al entrar en pantalla.
const aparicion = new IntersectionObserver(
  (entradas) => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;
      entrada.target.classList.add('is-in');
      aparicion.unobserve(entrada.target);
    }
  },
  { rootMargin: '0px 0px -10% 0px' },
);
document.querySelectorAll('[data-reveal]').forEach((el) => aparicion.observe(el));

animarRider(calma);
iniciarReproductor();

const show = document.querySelector<HTMLElement>('[data-show]');
const stage = show?.querySelector<HTMLElement>('[data-stage]');

if (show && stage) {
  const capas = [...stage.querySelectorAll<HTMLElement>('[data-capa]')];
  const escenas = [...stage.querySelectorAll<HTMLElement>('[data-escena]')];
  const videos = capas.map((capa) => capa.querySelector('video'));
  const total = escenas.length;

  let activa = -1;
  let tramo = 0;

  // El vídeo solo se mueve con el scroll: se pide un fotograma y, al llegar, se pide el último que haga falta.
  const buscar = () => {
    const video = videos[activa];
    if (!video || !video.classList.contains('is-ready') || video.seeking) return;
    const destino = tramo * Math.max(video.duration - 0.05, 0);
    if (Math.abs(video.currentTime - destino) > 0.02) video.currentTime = destino;
  };

  const cargar = (indice: number) => {
    const video = videos[indice];
    if (!video || sinVideo || video.src) return;
    video.addEventListener(
      'loadeddata',
      async () => {
        // iOS no muestra los fotogramas buscados hasta que el vídeo ha arrancado una vez.
        await video.play().catch(() => {});
        video.pause();
        video.classList.add('is-ready');
        buscar();
      },
      { once: true },
    );
    video.addEventListener('seeked', buscar);
    video.preload = 'auto';
    video.src = video.dataset.src ?? '';
  };

  const activar = (indice: number) => {
    if (indice === activa) return;
    activa = indice;
    capas.forEach((capa, i) => capa.classList.toggle('is-on', i === indice));
    escenas.forEach((escena, i) => escena.classList.toggle('is-on', i === indice));
    cargar(indice);
    cargar(indice + 1);
  };

  const pintar = (progreso: number) => {
    const posicion = progreso * total;
    const indice = Math.min(total - 1, Math.floor(posicion));
    tramo = Math.min(1, posicion - indice);
    activar(indice);
    buscar();
  };

  const recorrido = ScrollTrigger.create({
    trigger: show,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => pintar(self.progress),
    onRefresh: (self) => pintar(self.progress),
  });
  pintar(recorrido.progress);

  // Una escena no tiene posición propia en la página: su enlace lleva al punto del recorrido donde empieza.
  const destino = (hash: string) => {
    const id = hash.slice(1);
    if (!id) return null;
    const indice = escenas.findIndex((escena) => escena.id === id);
    if (indice >= 0) return recorrido.start + ((indice + 0.02) / total) * (recorrido.end - recorrido.start);
    const elemento = document.getElementById(id);
    return elemento ? elemento.getBoundingClientRect().top + window.scrollY : null;
  };

  document.addEventListener('click', (evento) => {
    const enlace = (evento.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!enlace) return;
    const y = destino(enlace.hash);
    if (y === null) return;
    evento.preventDefault();
    history.pushState(null, '', enlace.hash);
    irA(y);
  });

  // La onda acompaña toda la página, no solo las escenas.
  const marcas = [...document.querySelectorAll<HTMLAnchorElement>('[data-marca]')];
  const contador = document.querySelector<HTMLElement>('[data-contador]');
  const dosCifras = (n: number) => String(n).padStart(2, '0');
  let inicios: number[] = [];

  const pintarPagina = (progreso: number) => {
    document.documentElement.style.setProperty('--p', `${progreso * 100}%`);
    const linea = window.scrollY + window.innerHeight * 0.4;
    const indice = Math.max(0, inicios.findLastIndex((inicio) => inicio <= linea));
    marcas.forEach((marca, i) => marca.setAttribute('aria-current', String(i === indice)));
    if (contador) contador.textContent = `${dosCifras(indice + 1)} / ${dosCifras(marcas.length)}`;
  };

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => pintarPagina(self.progress),
    onRefresh: (self) => {
      inicios = marcas.map((marca) => destino(marca.hash) ?? 0);
      pintarPagina(self.progress);
    },
  });

  if (location.hash) {
    const y = destino(location.hash);
    if (y !== null) window.scrollTo(0, y);
  }
}
