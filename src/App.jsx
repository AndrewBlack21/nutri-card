import { useCallback, useEffect, useState } from "react";
import IntroAnimation from "./components/IntroAnimation";
import { nutritionist } from "./data";
import "./App.css";

const INTRO_SESSION_KEY = "nutritionist-intro-seen";

function shouldShowIntro() {
  try {
    if (sessionStorage.getItem(INTRO_SESSION_KEY) === "true") {
      return false;
    }

    // Marca a abertura imediatamente para evitar repetir
    // a animação se a página for recarregada durante a intro.
    sessionStorage.setItem(INTRO_SESSION_KEY, "true");

    return true;
  } catch {
    // Se o armazenamento estiver indisponível,
    // mostra a intro normalmente nesta montagem.
    return true;
  }
}
function getInitialMode() {
  if (typeof window === "undefined") return "landing";

  return window.matchMedia("(max-width: 767px)").matches ? "card" : "landing";
}

function getWhatsAppUrl(
  message = "Olá! Gostaria de saber mais sobre a consulta nutricional.",
) {
  const phone = nutritionist.whatsapp.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function Brand({ compact = false }) {
  return (
    <a
      className={`brand ${compact ? "brand--compact" : ""}`}
      href="#inicio"
      aria-label="Voltar ao início"
    >
      <span className="brand__symbol" aria-hidden="true">
        <svg viewBox="0 0 40 40" fill="none">
          <path
            d="M20 33C9 29 6 19 11 10C20 11 27 17 27 25C27 29 24 32 20 33Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M12 14C17 18 21 23 23 29"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M22 8C29 7 34 11 34 17C34 22 30 26 25 27"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </span>

      {!compact && (
        <span className="brand__text">
          <strong>{nutritionist.name}</strong>
          <small>Nutrição com propósito</small>
        </span>
      )}
    </a>
  );
}

function WhatsAppButton({ children = "Agendar consulta", className = "" }) {
  return (
    <a
      className={`button button--primary ${className}`}
      href={getWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20 11.7a8 8 0 0 1-11.8 7L4 20l1.3-4A8 8 0 1 1 20 11.7Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 8.5c.3-.5.6-.5.9-.1l1 1.5c.2.3.1.5-.2.8l-.5.5c.6 1.2 1.4 2 2.6 2.6l.5-.6c.2-.2.5-.3.8-.1l1.5.8c.4.2.4.6.1.9-.5.8-1.2 1.1-2.2.9-2.5-.6-5.3-3.3-5.8-5.8-.2-.7.2-1.1.5-1.4Z"
          fill="currentColor"
        />
      </svg>
      {children}
    </a>
  );
}

function InstagramLink({ className = "" }) {
  return (
    <a
      className={`button button--secondary ${className}`}
      href={nutritionist.instagram}
      target="_blank"
      rel="noopener noreferrer"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="5"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="17.5" cy="6.8" r="1" fill="currentColor" />
      </svg>
      Instagram
    </a>
  );
}

function ShareButton() {
  async function handleShare() {
    const shareData = {
      title: `${nutritionist.name} | ${nutritionist.title}`,
      text: nutritionist.slogan,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareData.url);
        window.alert("Link copiado! Você já pode compartilhar seu cartão.");
      } else {
        window.prompt("Copie o link do cartão:", shareData.url);
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        window.prompt("Copie o link para compartilhar:", window.location.href);
      }
    }
  }

  return (
    <button
      className="button button--outline button--full"
      type="button"
      onClick={handleShare}
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.7" />
        <path
          d="m8.7 10.6 6.6-4.2m-6.6 7 6.6 4.2"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
      Compartilhar cartão
    </button>
  );
}

function ViewSwitcher({ viewMode, onChange }) {
  return (
    <div className="view-switcher" aria-label="Modo de visualização">
      <button
        type="button"
        className={viewMode === "landing" ? "is-active" : ""}
        aria-pressed={viewMode === "landing"}
        onClick={() => onChange("landing")}
      >
        <span aria-hidden="true">▤</span>
        Site
      </button>

      <button
        type="button"
        className={viewMode === "card" ? "is-active" : ""}
        aria-pressed={viewMode === "card"}
        onClick={() => onChange("card")}
      >
        <span aria-hidden="true">▣</span>
        Cartão
      </button>
    </div>
  );
}

function NutritionistCard({ onShowLanding }) {
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardUrl = window.location.href.split("#")[0];
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&color=3d3833&bgcolor=ffffff&data=${encodeURIComponent(cardUrl)}`;

  async function copyCardLink() {
    try {
      await navigator.clipboard.writeText(cardUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt("Copie o link do cartão virtual:", cardUrl);
    }
  }

  return (
    <main className="virtual-card-page">
      <article className="virtual-card virtual-card--business">
        <div className="business-card__cover" aria-hidden="true">
          <span className="business-card__cover-leaf business-card__cover-leaf--one" />
          <span className="business-card__cover-leaf business-card__cover-leaf--two" />
          <span className="business-card__cover-label">NUTRIÇÃO • BEM-ESTAR • EQUILÍBRIO</span>
          <Brand compact />
        </div>

        <div className="business-card__body">
          <div className="business-card__profile">
            <div className="virtual-card__portrait">
              {!imageError ? (
                <img
                  className="business-card__photo"
                  src={nutritionist.photo}
                  alt={`Retrato de ${nutritionist.name}`}
                  fetchPriority="high"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="image-placeholder" aria-label="Foto não disponível">
                  <span>MO</span>
                </div>
              )}
              <span className="portrait-decoration" aria-hidden="true">✳</span>
            </div>

            <span className="eyebrow">SEU CUIDADO COMEÇA AQUI</span>
            <h1>{nutritionist.name}</h1>
            <p className="virtual-card__role">{nutritionist.title}</p>
            <p className="registration">{nutritionist.registration}</p>
            <p className="business-card__slogan">{nutritionist.slogan}</p>
            <p className="virtual-card__about">{nutritionist.description}</p>
          </div>

          <div className="business-card__contact">
            <a className="business-card__contact-item" href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
              <span className="business-card__contact-icon" aria-hidden="true">↗</span>
              <span><small>Agendamentos</small><strong>Conversar pelo WhatsApp</strong></span>
              <span className="business-card__contact-arrow" aria-hidden="true">↗</span>
            </a>
            <a className="business-card__contact-item" href={nutritionist.instagram} target="_blank" rel="noopener noreferrer">
              <span className="business-card__contact-icon" aria-hidden="true">◎</span>
              <span><small>Redes sociais</small><strong>Acompanhe no Instagram</strong></span>
              <span className="business-card__contact-arrow" aria-hidden="true">↗</span>
            </a>
            <a className="business-card__contact-item" href={`mailto:${nutritionist.email}`}>
              <span className="business-card__contact-icon" aria-hidden="true">✉</span>
              <span><small>E-mail</small><strong>{nutritionist.email}</strong></span>
              <span className="business-card__contact-arrow" aria-hidden="true">↗</span>
            </a>
          </div>

          <div className="business-card__share">
            <div className="business-card__share-copy">
              <span className="eyebrow">LEVE ESTE CARTÃO COM VOCÊ</span>
              <h2>Conecte-se com facilidade.</h2>
              <p>Compartilhe o link ou escaneie o QR Code para abrir este cartão no celular.</p>
              <button className="button button--primary button--full" type="button" onClick={copyCardLink}>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" stroke="currentColor" strokeWidth="1.7" />
                </svg>
                {copied ? "Link copiado!" : "Copiar link do cartão"}
              </button>
              <ShareButton />
            </div>
            <div className="business-card__qr-wrap">
              <img className="business-card__qr" src={qrUrl} alt="QR Code para abrir o cartão virtual" loading="lazy" />
              <span>APONTE A CÂMERA</span>
            </div>
          </div>

          <button className="text-link business-card__more" type="button" onClick={onShowLanding}>
            Conheça meu trabalho <span aria-hidden="true">↗</span>
          </button>

          <footer className="business-card__footer">
            <Brand compact />
            <span>{nutritionist.location}</span>
            <span>Nutrição com propósito</span>
          </footer>
        </div>
      </article>
    </main>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="section-heading">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

function Hero() {
  const [imageError, setImageError] = useState(false);

  return (
    <section className="hero" id="inicio">
      <div className="hero__content">
        <span className="eyebrow">NUTRIÇÃO COM ACOLHIMENTO E EQUILÍBRIO</span>

        <h1>
          Cuide de você.
          <br />
          <span>Sem abrir mão da sua vida.</span>
        </h1>

        <p className="hero__description">
          Alimentação equilibrada, acompanhamento individualizado e estratégias
          que respeitam sua rotina e seus objetivos.
        </p>

        <div className="hero__actions">
          <WhatsAppButton />
          <a className="button button--text" href="#servicos">
            Conheça os serviços <span aria-hidden="true">↓</span>
          </a>
        </div>

        <div className="hero__note">
          <span className="hero__note-icon" aria-hidden="true">
            ✳
          </span>
          <p>
            Pequenas escolhas, construídas com consistência, fazem parte de uma
            rotina mais equilibrada.
          </p>
        </div>
      </div>

      <div className="hero__visual">
        <div className="hero__image-frame">
          {!imageError ? (
            <img
              className="hero__photo"
              src={nutritionist.photo}
              alt={`Retrato profissional de ${nutritionist.name}`}
              fetchPriority="high"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="image-placeholder image-placeholder--large">
              <span>MO</span>
            </div>
          )}
        </div>

        <div className="hero__floating-note">
          <span className="hero__floating-icon" aria-hidden="true">
            ✳
          </span>
          <span>
            <strong>Seu cuidado começa aqui</strong>
            <small>Um passo de cada vez</small>
          </span>
        </div>

        <span className="hero__decor hero__decor--one" aria-hidden="true" />
        <span className="hero__decor hero__decor--two" aria-hidden="true" />
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="about section" id="sobre">
      {/* Imagem lateral */}
      <div className="about__visual">
        <img
          src={`${import.meta.env.BASE_URL}images/healthy food minimal beige.jpeg`}
          alt="Nutrição individualizada em um ambiente acolhedor"
          loading="lazy"
        />

        <div className="about__visual-caption">
          <span aria-hidden="true">✳</span>
          <p>Mais equilíbrio. Menos complicação.</p>
        </div>
      </div>

      {/* Texto lateral */}
      <div className="about__content">
        <span className="eyebrow">UM OLHAR INDIVIDUAL</span>

        <h2>Nutrição que considera você por inteiro.</h2>

        <p>{nutritionist.about}</p>

        <ul className="approach-list">
          {nutritionist.approach.map((item) => (
            <li key={item}>
              <span aria-hidden="true">✓</span>
              {item}
            </li>
          ))}
        </ul>

        <a className="text-link" href="#contato">
          Vamos conversar <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}

function Services() {
  const iconPaths = {
    consultation: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c.5-4 3-6 7-6s6.5 2 7 6" />
      </>
    ),
    food: (
      <>
        <path d="M4 12h16" />
        <path d="M6 12a6 6 0 0 0 12 0" />
        <path d="M12 6c0-2 2-3 4-3" />
      </>
    ),
    followup: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  };

  return (
    <section className="services section" id="servicos">
      <SectionHeading
        eyebrow="COMO POSSO AJUDAR"
        title="Um cuidado pensado para sua rotina."
        description="Conheça as possibilidades de acompanhamento e encontre o caminho mais adequado às suas necessidades."
      />

      <div className="services__grid">
        {nutritionist.services.map((service, index) => (
          <article className="service-card" key={service.id}>
            {service.image ? (
              <img
                className="service-card__image"
                src={service.image}
                alt=""
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="service-card__image-placeholder">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {iconPaths[service.icon]}
                </svg>
              </div>
            )}

            <div className="service-card__body">
              <span className="service-card__number">0{index + 1}</span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <a
                className="text-link"
                href={getWhatsAppUrl(
                  `Olá! Gostaria de saber mais sobre: ${service.title}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                Tenho interesse <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Highlights() {
  return (
    <section className="highlights section">
      <div className="highlights__intro">
        <span className="eyebrow">CUIDADO COM PROPÓSITO</span>
        <h2>Seu processo, suas necessidades, seu ritmo.</h2>
      </div>

      <div className="highlights__grid">
        {nutritionist.achievements.map((item) => (
          <article className="highlight" key={item.label}>
            <strong>{item.number}</strong>
            <span>{item.label}</span>
          </article>
        ))}
      </div>
      <p className="highlights__disclaimer">
        Informações demonstrativas. Atualize os dados antes de publicar.
      </p>
    </section>
  );
}

function Contact() {
  return (
    <section className="contact section" id="contato">
      <div className="contact__content">
        <span className="eyebrow">SEU PRÓXIMO PASSO</span>
        <h2>Vamos conversar sobre seus objetivos?</h2>
        <p>
          Entre em contato para conhecer o formato de atendimento e tirar suas
          dúvidas.
        </p>
        <WhatsAppButton>Falar pelo WhatsApp</WhatsAppButton>
      </div>

      <div className="contact__decoration" aria-hidden="true">
        <svg viewBox="0 0 180 180" fill="none">
          <path
            d="M89 151C48 130 29 93 47 57C77 59 105 83 106 111C107 128 99 142 89 151Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M49 65C66 84 82 111 91 144"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M98 37C127 29 150 46 151 72C152 98 133 117 111 120"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </section>
  );
}

function Footer({ onShowCard }) {
  return (
    <footer className="footer">
      <Brand />
      <p>Nutrição com acolhimento, equilíbrio e individualidade.</p>
      <button className="text-link" type="button" onClick={onShowCard}>
        Ver cartão virtual <span aria-hidden="true">↗</span>
      </button>
      <small>
        © {new Date().getFullYear()} {nutritionist.name}. Todos os direitos
        reservados.
      </small>
    </footer>
  );
}

function LandingPage({ onShowCard }) {
  return (
    <main className="landing-page">
      <div className="landing-container">
        <Hero />
        <About />
        <Services />
        <Highlights />
        <Contact />
        <Footer onShowCard={onShowCard} />
      </div>
    </main>
  );
}

export default function App() {
  const [viewMode, setViewMode] = useState(getInitialMode);
  const [showIntro, setShowIntro] = useState(shouldShowIntro);

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  useEffect(() => {
    document.title =
      viewMode === "card"
        ? `${nutritionist.name} | Cartão Virtual`
        : `${nutritionist.name} | Nutrição`;
  }, [viewMode]);

  return (
    <div className={`app app--${viewMode}`}>
      {showIntro && (
        <IntroAnimation
          name={nutritionist.name}
          slogan={nutritionist.slogan}
          onComplete={handleIntroComplete}
        />
      )}

      <header className="app-header">
        <Brand />
        <ViewSwitcher viewMode={viewMode} onChange={setViewMode} />
      </header>

      {viewMode === "card" ? (
        <NutritionistCard onShowLanding={() => setViewMode("landing")} />
      ) : (
        <LandingPage onShowCard={() => setViewMode("card")} />
      )}
    </div>
  );
}
