import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { apiGetArticles, apiGetArticleBySlug, apiGetClinics } from "./api";
import { ChatWidget, ChatWindow, useCatChat } from "./chat";
import type { Article, ArticleDetail, Clinic } from "./types";

const PHOTO = {
  hero: "/gatos/siesta-verde.jpg",
  consulta: "/gatos/tuxedo-atento.jpg",
  lista: "/gatos/lista.jpg",
  pie: "/gatos/abrazo-felino.jpg",
};

interface NewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  summary: string;
  content: string;
  image: string;
  badge: string;
}

const NEWS_LIST: NewsItem[] = [
  {
    id: "noticia-1",
    badge: "NUTRICIÓN AVANZADA",
    title: "Alimentación húmeda en climas cálidos: por qué es vital para los riñones de tu gato",
    category: "Salud & Nutrición",
    date: "28 Oct 2026",
    readTime: "3 min de lectura",
    image: "/gatos/compania.jpg",
    summary: "Los gatos descienden de animales desérticos y tienen poca sed innata. Descubre cómo combinar alimento húmedo y fuentes de agua en Caracas para prevenir la enfermedad renal crónica.",
    content: `La deshidratación silenciosa es una de las principales causas de consultas veterinarias felinas en climas tropicales y cálidos como el de Caracas.

¿Por qué tu gato casi no bebe agua?
Los ancestros del gato doméstico (Felis lybica) obtenían cerca del 75% del agua directamente de sus presas. Por eso, su instinto de sed no se activa con la misma frecuencia que en perros o humanos. Cuando un gato consume exclusivamente alimento seco (pienso/croquetas, con apenas 8-10% de humedad), vive en un estado de ligera deshidratación crónica si no compensa activamente.

Recomendaciones prácticas:
1. Incorpora alimento húmedo diario: Una porción de paté o sobre húmedo de calidad garantiza aporte hídrico directo.
2. Fuentes de agua en movimiento: Los gatos desconfían del agua estancada. Las fuentes con filtro estimulan hasta un 40% más el consumo de agua.
3. Separa el plato de agua de la comida y el arenero: Por instinto evolutivo, los gatos rechazan beber cerca de donde comen o defecan para evitar contaminación.`,
  },
  {
    id: "noticia-2",
    badge: "BIENESTAR URBANO",
    title: "Gatos de apartamento en Caracas: cómo enriquecer su espacio y evitar el aburrimiento",
    category: "Comportamiento",
    date: "25 Oct 2026",
    readTime: "4 min de lectura",
    image: "/gatos/juego-en-el-jardin.jpg",
    summary: "Vivir en interiores protege a los felinos de peligros externos, pero requiere estimulación vertical, rascadores estratégicos y ventanas seguras para mantener su equilibrio mental.",
    content: `Un felino que no gasta energía mental ni física en casa suele desarrollar conductas compensatorias: acicalamiento compulsivo, maullidos nocturnos o apatía.

Pilares del enriquecimiento vertical:
• Territorio tridimensional: Los gatos se sienten seguros en las alturas. Instalar repisas felinas o árboles rascadores cerca de ventanas les permite vigilar su entorno.
• Rutina de caza simulada: Utiliza varitas con plumas o ratones de juguete durante 10 a 15 minutos antes de su cena. Completar la secuencia "acechar -> atrapar -> comer" genera dopamina y calma.
• Protección en ventanas: En edificios de Caracas, las mallas de seguridad anticaídas son indispensables. El 'síndrome del gato paracaidista' es completamente prevenible.`,
  },
  {
    id: "noticia-3",
    badge: "MEDICINA PREVENTIVA",
    title: "Vacunación y desparasitación felina: protocolo esencial recomendado",
    category: "Salud Preventiva",
    date: "22 Oct 2026",
    readTime: "5 min de lectura",
    image: "/gatos/mirada-curiosa.jpg",
    summary: "Guía completa de inmunización: Triple Felina, Rabia y Leucemia. Cuándo vacunar, refuerzos anuales y la importancia de exámenes preventivos en clínicas de la ciudad.",
    content: `La medicina preventiva es el método más eficaz y económico para asegurar una vida larga y saludable a tu felino (15 a 18 años promedio).

Esquema fundamental:
• Trivalente Felina (Panleucopenia, Rinotraqueitis y Calicivirus): Inicia a partir de las 8 semanas de vida con sus respectivos refuerzos y revacunación anual o trianual según criterio médico.
• Rabia: Obligatoria por ley en Venezuela a partir de los 3 meses de edad, con refuerzo anual.
• Desparasitación interna y externa: Incluso los gatos que no salen a la calle pueden albergar pulgas transportadas en el calzado de las personas o consumir parásitos microscópicos.

Verifica siempre el carnet de vacunación en centros veterinarios certificados.`,
  },
  {
    id: "noticia-4",
    badge: "CONDUCTA & SÍNTOMAS",
    title: "El dolor silencioso: cómo detectar que tu gato no se siente bien antes de que sea tarde",
    category: "Salud Preventiva",
    date: "18 Oct 2026",
    readTime: "4 min de lectura",
    image: "/gatos/michi-negro.jpg",
    summary: "Los gatos son maestros en ocultar debilidades por instinto de supervivencia. Aprende a leer micromovimientos, cambios en la caja de arena y posturas de dolor.",
    content: `A diferencia de los perros, que suelen expresar dolor vocalmente, los gatos enmascaran el malestar para no parecer vulnerables ante depredadores imaginarios.

Microseñales de alarma temprana:
• Disminución del aseo o pelaje desaliñado en zonas lumbares.
• Cambios en la postura: Postura en esfinge tensa, con la cabeza gacha y ojos semicerrados.
• Evitación del arenero o visitas frecuentes sin orinar (alerta de obstrucción urinaria, emergencia médica).
• Aislamiento repentino en lugares oscuros donde normalmente no duerme.

Ante cualquiera de estas señales, consulta de inmediato a tu médico veterinario de cabecera.`,
  },
];

const CAROUSEL_SLIDES = [
  {
    id: 1,
    image: "/gatos/abrazo-felino.jpg",
    title: "Abrazo y descanso fraternal",
    location: "Caracas, Chacao",
    tag: "Convivencia Armónica",
    desc: "El contacto físico y descanso compartido reduce los niveles de cortisol en felinos y promueve estabilidad emocional en el hogar.",
  },
  {
    id: 2,
    image: "/gatos/tuxedo-atento.jpg",
    title: "Atención y curiosidad activa",
    location: "Caracas, Los Palos Grandes",
    tag: "Agudeza Mental",
    desc: "Mirada fija y orejas erguidas: la postura de alerta positiva antes de una sesión de juego y estimulación cognitiva.",
  },
  {
    id: 3,
    image: "/gatos/siesta-verde.jpg",
    title: "Compañeros inseparables de siesta",
    location: "Caracas, El Hatillo",
    tag: "Bienestar en el Hogar",
    desc: "Dormir panza arriba sobre superficies frescas es una señal inequívoca de confianza y relajación absoluta en su territorio.",
  },
  {
    id: 4,
    image: "/gatos/juego-en-el-jardin.jpg",
    title: "Agilidad y estimulación diaria",
    location: "Caracas, Baruta",
    tag: "Juego & Ejercicio",
    desc: "Sesiones estructuradas de juego interactivo para mantener articulaciones saludables y prevenir sobrepeso.",
  },
];

function useReveal(dep: unknown) {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)"));
    if (!items.length) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach(item => item.classList.add("is-in"));
      return;
    }
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "240px 0px 240px 0px", threshold: 0 }
    );
    items.forEach(item => observer.observe(item));
    return () => observer.disconnect();
  }, [dep]);
}

function useHeroTilt(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reduced.matches) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        element.style.setProperty("--rx", `${(-y * 3.4).toFixed(2)}deg`);
        element.style.setProperty("--ry", `${(x * 3.4).toFixed(2)}deg`);
      });
    };
    const reset = () => {
      element.style.setProperty("--rx", "0deg");
      element.style.setProperty("--ry", "0deg");
    };
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", reset);
    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", reset);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref]);
}

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [municipality, setMunicipality] = useState("");
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [clinicBusy, setClinicBusy] = useState(false);
  const [clinicError, setClinicError] = useState("");
  const chat = useCatChat();
  const [articleError, setArticleError] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<ArticleDetail | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [articleBusy, setArticleBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  useReveal(articles.length + (selectedNews ? 1 : 0));
  useHeroTilt(heroRef);

  async function loadArticles() {
    setArticleError("");
    try {
      setArticles(await apiGetArticles());
    } catch {
      setArticleError("No pudimos cargar la biblioteca. Verifica la conexión con Supabase o la API.");
    }
  }

  useEffect(() => {
    void loadArticles();
    void loadClinics("", false);
  }, []);

  async function loadClinics(zone: string, emergency: boolean) {
    setClinicBusy(true);
    setClinicError("");
    try {
      setClinics(await apiGetClinics(zone, emergency));
    } catch {
      setClinics([]);
      setClinicError("No pudimos consultar el directorio. Verifica la conexión con Supabase o la API.");
    } finally {
      setClinicBusy(false);
    }
  }

  async function openArticle(article: Article) {
    setArticleBusy(true);
    setSelectedArticle({ ...article, content: "" });
    try {
      setSelectedArticle(await apiGetArticleBySlug(article.slug));
    } catch {
      setArticleError("Este artículo no está disponible en este momento.");
      setSelectedArticle(null);
    } finally {
      setArticleBusy(false);
    }
  }

  function nextSlide() {
    setCurrentSlide(prev => (prev + 1) % CAROUSEL_SLIDES.length);
  }

  function prevSlide() {
    setCurrentSlide(prev => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  }

  return (
    <div className="page">
      <header className="masthead">
        <a className="wordmark" href="#top">
          <span className="wordmark-icon">
            <Zap size={20} className="thunder-bolt" />
          </span>
          <span className="wordmark-text">
            Mundo<b>Felino</b>
          </span>
        </a>
        <button
          className="menu-button"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={menuOpen ? "nav is-open" : "nav"} aria-label="Principal">
          <a href="#noticias" onClick={() => setMenuOpen(false)}>Noticias</a>
          <a href="#consulta" onClick={() => setMenuOpen(false)}>Consulta</a>
          <a href="#biblioteca" onClick={() => setMenuOpen(false)}>Biblioteca</a>
          <a href="#galeria" onClick={() => setMenuOpen(false)}>Galería</a>
          <a href="#veterinarios" onClick={() => setMenuOpen(false)}>Veterinarios</a>
          <a className="nav-action" href="#consulta" onClick={() => setMenuOpen(false)}>
            <Zap size={14} /> Hablemos
          </a>
        </nav>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="hero" aria-labelledby="hero-title">
          <h1 id="hero-title" className="hero-title">
            Un mundo felino<br />
            <span className="text-gradient">para tu gato.</span>
          </h1>
          <div className="hero-copy">
            <div className="hero-pill">
              <span className="pulse-dot" />
              <Zap size={12} className="pill-bolt" />
              <span>CONEXIÓN & ATENCIÓN EN CARACAS</span>
            </div>
            <p className="hero-lead">
              Orientación veterinaria, una biblioteca de cuidados y un asistente para las familias de Caracas.
            </p>
            <div className="hero-actions">
              <a className="button button-glow" href="#consulta">
                <span>Hacer una consulta</span> <ArrowRight size={18} />
              </a>
              <a className="link-arrow" href="#noticias">
                <span>Ver novedades felinas</span> <ArrowUpRight size={16} />
              </a>
            </div>
            <div className="hero-stats">
              <div className="stat-card">
                <span className="stat-value">24/7</span>
                <span className="stat-label">Asistencia IA</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-card">
                <span className="stat-value">100%</span>
                <span className="stat-label">Simétrico</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-card">
                <span className="stat-value">Caracas</span>
                <span className="stat-label">Cobertura</span>
              </div>
            </div>
          </div>
          <figure className="hero-figure" ref={heroRef}>
            <div className="hero-frame-wrap">
              <span className="frame-corner frame-corner-tl" />
              <span className="frame-corner frame-corner-br" />
              <img
                src={PHOTO.hero}
                alt="Dos gatos descansando plácidamente juntos sobre una alfombra verde"
                width={1600}
                height={1000}
                fetchPriority="high"
              />
              <div className="hero-figure-badge">
                <Activity size={13} className="badge-pulse" />
                <span>Michis · En Casa</span>
              </div>
            </div>
            <figcaption>Compañeros de siesta. Caracas.</figcaption>
          </figure>
        </section>

        {/* NOTICIAS Y DOCUMENTACIÓN DE INTERÉS (TARJETAS CON ELEVACIÓN) */}
        <section id="noticias" className="section noticias" aria-labelledby="noticias-title">
          <div className="section-head" data-reveal>
            <span className="section-pill">
              <Sparkles size={12} /> NOVEDADES & DOCUMENTACIÓN FELINA
            </span>
            <h2 id="noticias-title">
              Noticias y avances <span className="text-gradient">para su cuidado</span>.
            </h2>
            <p className="section-sublead">
              Artículos de fondo, nutrición y consejos prácticos elaborados para cuidadores en Caracas. Coloca el ratón sobre cada tarjeta para explorar los detalles.
            </p>
          </div>

          <div className="news-cards-grid">
            {NEWS_LIST.map((item, index) => (
              <article
                key={item.id}
                className="elevated-card news-card"
                data-reveal
                style={{ "--d": `${index * 80}ms` } as React.CSSProperties}
                onClick={() => setSelectedNews(item)}
              >
                <div className="elevated-card-media">
                  <img src={item.image} alt={item.title} loading="lazy" />
                  <span className="elevated-card-badge">{item.badge}</span>
                </div>
                <div className="elevated-card-body">
                  <div className="elevated-card-meta">
                    <span><Calendar size={13} /> {item.date}</span>
                    <span><Clock size={13} /> {item.readTime}</span>
                  </div>
                  <h3 className="elevated-card-title">{item.title}</h3>
                  <p className="elevated-card-desc">{item.summary}</p>
                  <div className="elevated-card-footer">
                    <span className="elevated-card-link">
                      Leer artículo completo <ArrowRight size={15} />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CONSULTA */}
        <section id="consulta" className="section consulta" aria-labelledby="consulta-title">
          <div className="consulta-copy" data-reveal>
            <span className="section-pill">
              <Zap size={12} /> ASISTENTE VIRTUAL
            </span>
            <h2 id="consulta-title">Hablemos de tu gato.</h2>
            <p>
              Cuenta qué notas. Te orientamos sobre alimentación, salud preventiva y comportamiento, y te decimos cuándo conviene llamar a su veterinario.
            </p>
            <div className="consulta-badges">
              <div className="c-badge"><ShieldCheck size={15} /> Orientación educativa</div>
              <div className="c-badge"><Zap size={15} /> Respuesta inmediata</div>
            </div>
            <p className="fine">
              La consulta es educativa. No sustituye la evaluación de un profesional.
            </p>
          </div>
          <figure className="consulta-figure" data-reveal>
            <div className="figure-frame">
              <img
                src={PHOTO.consulta}
                alt="Gato tuxedo blanco y negro atento mirando a la cámara"
                width={1000}
                height={1250}
                loading="lazy"
              />
            </div>
            <figcaption>Michi atento a tu consulta. Caracas.</figcaption>
          </figure>
          <div className="consulta-chat" data-reveal data-ui>
            <ChatWindow chat={chat} id="consulta" onOpenArticle={source => void openArticle({ id: source.slug, ...source })} />
          </div>
        </section>

        {/* BIBLIOTECA */}
        <section id="biblioteca" className="section biblioteca" aria-labelledby="biblioteca-title">
          <div className="section-head" data-reveal>
            <span className="section-pill">
              <BookOpen size={12} /> BASE DE CONOCIMIENTO
            </span>
            <h2 id="biblioteca-title">Lo que conviene saber.</h2>
          </div>
          <div className="biblioteca-body">
            <figure className="biblioteca-figure" data-reveal>
              <div className="figure-frame">
                <img
                  src={PHOTO.lista}
                  alt="Gato negro mirando a cámara"
                  width={900}
                  height={1125}
                  loading="lazy"
                />
              </div>
              <figcaption>Doce lecturas breves, escritas para consultar a mano.</figcaption>
            </figure>
            <div className="biblioteca-list">
              {articleError && (
                <div className="notice" role="alert">
                  <span>{articleError}</span>
                  <button type="button" onClick={() => void loadArticles()}>Intentar de nuevo</button>
                </div>
              )}
              {articles.length ? (
                <ul>
                  {articles.map((article, index) => (
                    <li
                      key={article.id}
                      className="article-row"
                      data-reveal
                      style={{ "--d": `${Math.min(index, 6) * 45}ms` } as React.CSSProperties}
                    >
                      <button type="button" onClick={() => void openArticle(article)}>
                        <span className="article-cat">{article.category}</span>
                        <span className="article-name">{article.title}</span>
                        <span className="article-summary">{article.summary}</span>
                        <ArrowUpRight className="article-arrow" size={20} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : !articleError ? (
                <p className="fine">Estamos preparando la biblioteca felina.</p>
              ) : null}
            </div>
          </div>
        </section>

        {/* CARRUSEL Y GALERÍA DESLIZANTE INTERACTIVA */}
        <section id="galeria" className="section galeria" aria-labelledby="galeria-title">
          <div className="section-head" data-reveal>
            <div className="gallery-header-row">
              <div>
                <span className="section-pill">
                  <Sparkles size={12} /> GALERÍA Y COMUNIDAD INTERACTIVA
                </span>
                <h2 id="galeria-title">La vida es mejor<br />con bigotes.</h2>
              </div>
              <div className="carousel-nav-buttons" aria-label="Controles del carrusel">
                <button
                  type="button"
                  className="carousel-btn"
                  onClick={prevSlide}
                  aria-label="Diapositiva anterior"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="carousel-counter">
                  <b>{currentSlide + 1}</b> / {CAROUSEL_SLIDES.length}
                </span>
                <button
                  type="button"
                  className="carousel-btn"
                  onClick={nextSlide}
                  aria-label="Diapositiva siguiente"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Carrusel Deslizante */}
          <div className="carousel-container" data-reveal>
            <div
              className="carousel-track"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {CAROUSEL_SLIDES.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`carousel-slide ${index === currentSlide ? "is-active" : ""}`}
                  aria-hidden={index !== currentSlide}
                >
                  <div className="carousel-slide-inner elevated-card">
                    <div className="carousel-image-box">
                      <img src={slide.image} alt={slide.title} loading="lazy" />
                      <span className="carousel-slide-tag">{slide.tag}</span>
                    </div>
                    <div className="carousel-caption-box">
                      <span className="carousel-location">
                        <MapPin size={14} /> {slide.location}
                      </span>
                      <h3>{slide.title}</h3>
                      <p>{slide.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Indicadores de puntos (Dots) */}
            <div className="carousel-dots" role="tablist" aria-label="Selector de diapositiva">
              {CAROUSEL_SLIDES.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  className={`carousel-dot ${index === currentSlide ? "is-active" : ""}`}
                  aria-selected={index === currentSlide}
                  aria-label={`Ir a diapositiva ${index + 1}: ${slide.title}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* VETERINARIOS */}
        <section id="veterinarios" className="section veterinarios" aria-labelledby="vets-title">
          <div className="vets-head" data-reveal>
            <div>
              <span className="section-pill">
                <MapPin size={12} /> RED DE ATENCIÓN
              </span>
              <h2 id="vets-title">Cuando lo necesitan,<br /><span className="text-gradient">estamos cerca</span>.</h2>
            </div>
            <p>Busca un centro por municipio, revisa su dirección y confirma horarios antes de salir.</p>
          </div>

          <form
            className="vets-form"
            onSubmit={event => {
              event.preventDefault();
              void loadClinics(municipality, emergencyOnly);
            }}
            data-reveal
          >
            <div className="vets-search-bar">
              <label className="vets-search">
                <span className="visually-hidden">Buscar por municipio</span>
                <Search size={18} aria-hidden="true" className="search-icon" />
                <input
                  value={municipality}
                  onChange={event => setMunicipality(event.target.value)}
                  placeholder="Chacao, Baruta, El Hatillo…"
                />
              </label>
              <label className="vets-check">
                <input
                  type="checkbox"
                  checked={emergencyOnly}
                  onChange={event => setEmergencyOnly(event.target.checked)}
                />
                <span className="vets-check-mark" />
                <span>Con urgencias</span>
              </label>
              <button className="button button-glow" type="submit">
                <Search size={15} /> <span>Buscar centros</span>
              </button>
            </div>
          </form>

          {clinicError && (
            <div className="notice" role="alert">
              <span>{clinicError}</span>
              <button type="button" onClick={() => void loadClinics(municipality, emergencyOnly)}>
                Intentar de nuevo
              </button>
            </div>
          )}

          <div className="vets-list" aria-live="polite">
            {clinics.length ? (
              clinics.map(clinic => (
                <article className="clinic elevated-card" key={clinic.id}>
                  <div className="clinic-main">
                    <h3>
                      {clinic.name}
                      {clinic.emergencyAvailable && (
                        <span className="clinic-flag">
                          <span className="pulse-dot-urgent" /> Urgencias reportadas
                        </span>
                      )}
                    </h3>
                    <p>
                      <MapPin size={15} aria-hidden="true" className="clinic-pin" />
                      <span>{clinic.address}{clinic.municipality ? ` · ${clinic.municipality}` : ""}</span>
                    </p>
                    {clinic.lastVerifiedAt && (
                      <p className="fine clinic-verified">
                        <ShieldCheck size={13} aria-hidden="true" /> Ficha verificada el {new Date(clinic.lastVerifiedAt).toLocaleDateString("es-VE")}
                      </p>
                    )}
                  </div>
                  <div className="clinic-actions">
                    {clinic.phone && (
                      <a className="clinic-btn clinic-btn-phone" href={`tel:${clinic.phone}`} aria-label={`Llamar a ${clinic.name}`}>
                        <Phone size={15} aria-hidden="true" /> Llamar
                      </a>
                    )}
                    {clinic.whatsapp && (
                      <a
                        className="clinic-btn clinic-btn-wa"
                        href={`https://wa.me/${clinic.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Escribir por WhatsApp a ${clinic.name}`}
                      >
                        <MessageCircle size={15} aria-hidden="true" /> WhatsApp
                      </a>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <p className="fine vets-empty">
                {clinicBusy
                  ? "Buscando centros…"
                  : clinicError
                  ? "Revisa la conexión con la API y vuelve a intentar."
                  : "Aún no hay centros en esta búsqueda. Prueba con otro municipio o vuelve pronto."}
              </p>
            )}
          </div>
          <p className="fine vets-note">
            <ShieldCheck size={14} /> Confirma los datos y horarios con cada centro antes de acudir.
          </p>
        </section>
      </main>

      <footer className="footer">
        <figure className="footer-figure">
          <div className="figure-frame">
            <img src={PHOTO.pie} alt="Dos gatos descansando abrazados y dormidos juntos" loading="lazy" />
          </div>
        </figure>
        <div className="footer-menu">
          <div className="footer-brand">
            <span className="wordmark">
              <span className="wordmark-icon">
                <Zap size={20} className="thunder-bolt" />
              </span>
              <span className="wordmark-text">
                Mundo<b>Felino</b>
              </span>
            </span>
          </div>
          <nav aria-label="Pie de página">
            <a href="#noticias">Noticias</a>
            <a href="#consulta">Consulta</a>
            <a href="#biblioteca">Biblioteca</a>
            <a href="#galeria">Galería</a>
            <a href="#veterinarios">Veterinarios</a>
          </nav>
          <div className="footer-meta">
            <p className="location-tag">
              <MapPin size={13} /> Caracas, Venezuela
            </p>
            <p className="fine">Orientación educativa. Ante una emergencia, acude a una clínica veterinaria.</p>
            <span className="fine copy">© {new Date().getFullYear()} Mundo Felino</span>
          </div>
        </div>
      </footer>

      <ChatWidget chat={chat} onOpenArticle={source => void openArticle({ id: source.slug, ...source })} />

      {/* ARTICLE MODAL */}
      {(selectedArticle || articleBusy) && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              setSelectedArticle(null);
              setArticleBusy(false);
            }
          }}
        >
          <article className="article-modal" role="dialog" aria-modal="true" aria-label={selectedArticle?.title || "Artículo"}>
            <button
              className="modal-close"
              type="button"
              onClick={() => {
                setSelectedArticle(null);
                setArticleBusy(false);
              }}
              aria-label="Cerrar artículo"
            >
              <X size={20} />
            </button>
            {articleBusy ? (
              <p className="fine">Abriendo artículo…</p>
            ) : (
              selectedArticle && (
                <>
                  <span className="article-cat-badge">{selectedArticle.category}</span>
                  <h2>{selectedArticle.title}</h2>
                  {selectedArticle.summary && <p className="modal-summary">{selectedArticle.summary}</p>}
                  <div className="modal-content">{selectedArticle.content}</div>
                  <p className="fine modal-note">
                    <ShieldCheck size={14} aria-hidden="true" /> Información educativa. Para recomendaciones sobre tu gato, consulta con un veterinario.
                  </p>
                  <button className="button button-card" type="button" onClick={() => setSelectedArticle(null)}>
                    Volver a la página <ArrowRight size={15} />
                  </button>
                </>
              )
            )}
          </article>
        </div>
      )}

      {/* NEWS MODAL */}
      {selectedNews && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setSelectedNews(null);
          }}
        >
          <article className="article-modal news-modal" role="dialog" aria-modal="true" aria-label={selectedNews.title}>
            <button
              className="modal-close"
              type="button"
              onClick={() => setSelectedNews(null)}
              aria-label="Cerrar noticia"
            >
              <X size={20} />
            </button>
            <div className="modal-news-header">
              <span className="elevated-card-badge">{selectedNews.badge}</span>
              <div className="elevated-card-meta">
                <span><Calendar size={13} /> {selectedNews.date}</span>
                <span><Clock size={13} /> {selectedNews.readTime}</span>
              </div>
            </div>
            <h2>{selectedNews.title}</h2>
            <div className="modal-news-image">
              <img src={selectedNews.image} alt={selectedNews.title} />
            </div>
            <p className="modal-summary">{selectedNews.summary}</p>
            <div className="modal-content">{selectedNews.content}</div>
            <p className="fine modal-note">
              <ShieldCheck size={14} aria-hidden="true" /> Documentación educativa elaborada para la comunidad felina de Caracas.
            </p>
            <button className="button button-glow" type="button" onClick={() => setSelectedNews(null)}>
              Volver a las noticias <ArrowRight size={15} />
            </button>
          </article>
        </div>
      )}
    </div>
  );
}
