import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Armado de la cabina: los CDJ entran por los lados, el mixer cae al centro y todo se enciende.
export function animarRider(calma: boolean) {
  const rider = document.querySelector<HTMLElement>('[data-rider]');
  if (!rider) return;

  const q = gsap.utils.selector(rider);
  const izquierda = q('[data-rider-equipo="izquierda"]');
  const derecha = q('[data-rider-equipo="derecha"]');
  const mixer = q('[data-rider-equipo="mixer"]');
  const equipos = q('[data-rider-equipo]');

  const linea = gsap.timeline({ defaults: { ease: 'power3.out' } });
  linea
    .from(q('[data-rider-titulo]'), { y: 60, opacity: 0, duration: 0.15 }, 0)
    .fromTo(izquierda, { xPercent: -160, rotate: -28, opacity: 0 }, { xPercent: 0, rotate: 0, opacity: 1, duration: 0.3 }, 0.08)
    .fromTo(derecha, { xPercent: 160, rotate: 28, opacity: 0 }, { xPercent: 0, rotate: 0, opacity: 1, duration: 0.3 }, 0.08)
    .fromTo(mixer, { yPercent: -120, scale: 1.25, rotate: 6, opacity: 0 }, { yPercent: 0, scale: 1, rotate: 0, opacity: 1, duration: 0.25, ease: 'bounce.out' }, 0.3)
    .fromTo(q('[data-jog]'), { rotate: 0 }, { rotate: (i) => (i % 2 ? -720 : 720), duration: 1, ease: 'none' }, 0)
    .fromTo(equipos, { filter: 'grayscale(1) brightness(0.7)' }, { filter: 'grayscale(0) brightness(1)', duration: 0.15, ease: 'none' }, 0.58)
    .fromTo(q('[data-rider-luz]'), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.2 }, 0.56)
    .from(q('[data-rider-dato]'), { y: 40, opacity: 0, stagger: 0.06, duration: 0.15 }, 0.66);

  if (calma) {
    linea.progress(1).pause();
    return;
  }

  ScrollTrigger.create({
    trigger: rider,
    start: 'top 70%',
    end: 'bottom bottom',
    animation: linea,
    scrub: 0.6,
  });
}
