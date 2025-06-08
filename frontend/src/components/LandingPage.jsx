import React from 'react';

const LandingPage = ({ onLogin, onRegister }) => {
  return (
    <div className="landing-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1>🐾 Pet Finder Salvador</h1>
          <p className="hero-subtitle">
            Plataforma colaborativa para encontrar animais perdidos em Salvador
          </p>
          <p className="hero-description">
            Conectamos pessoas que perderam seus pets com quem os encontrou, 
            usando a força da comunidade para reunir famílias.
          </p>
          
          <div className="stats">
            <div className="stat">
              <strong>500+</strong>
              <span>Pets reunificados</span>
            </div>
            <div className="stat">
              <strong>1000+</strong>
              <span>Usuários ativos</span>
            </div>
            <div className="stat">
              <strong>163</strong>
              <span>Bairros cobertos</span>
            </div>
          </div>

          <div className="cta-buttons">
            <button onClick={onLogin} className="btn btn-primary">
              Entrar
            </button>
            <button onClick={onRegister} className="btn btn-secondary">
              Cadastrar-se
            </button>
          </div>
        </div>

        <div className="hero-image">
          <div className="pet-illustration">
            🐕🐱
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>Como Funciona</h2>
        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon">📍</div>
            <h3>Cadastre o Local</h3>
            <p>Informe o bairro onde o pet foi perdido ou encontrado</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📸</div>
            <h3>Adicione uma Foto</h3>
            <p>Uma imagem vale mais que mil palavras na identificação</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🤝</div>
            <h3>Conecte-se</h3>
            <p>A comunidade te ajuda a encontrar ou devolver o pet</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .landing-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .hero-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          padding: 4rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
          align-items: center;
          min-height: 80vh;
        }

        .hero-content h1 {
          font-size: 3.5rem;
          margin-bottom: 1rem;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .hero-subtitle {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          opacity: 0.9;
        }

        .hero-description {
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 2rem;
          opacity: 0.8;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin: 2rem 0;
        }

        .stat {
          text-align: center;
          padding: 1rem;
          background: rgba(255,255,255,0.1);
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .stat strong {
          display: block;
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .stat span {
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .btn {
          padding: 1rem 2rem;
          border: none;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 150px;
        }

        .btn-primary {
          background: white;
          color: #667eea;
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(255,255,255,0.3);
        }

        .btn-secondary {
          background: transparent;
          color: white;
          border: 2px solid white;
        }

        .btn-secondary:hover {
          background: white;
          color: #667eea;
          transform: translateY(-3px);
        }

        .hero-image {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .pet-illustration {
          font-size: 15rem;
          text-shadow: 0 0 50px rgba(255,255,255,0.3);
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .features-section {
          background: white;
          color: #333;
          padding: 4rem 2rem;
        }

        .features-section h2 {
          text-align: center;
          font-size: 2.5rem;
          margin-bottom: 3rem;
          color: #667eea;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 3rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .feature {
          text-align: center;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }

        .feature:hover {
          transform: translateY(-5px);
        }

        .feature-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .feature h3 {
          color: #667eea;
          margin-bottom: 1rem;
          font-size: 1.3rem;
        }

        .feature p {
          color: #666;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .hero-section {
            grid-template-columns: 1fr;
            text-align: center;
            padding: 2rem 1rem;
          }

          .hero-content h1 {
            font-size: 2.5rem;
          }

          .stats {
            grid-template-columns: 1fr;
          }

          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }

          .pet-illustration {
            font-size: 8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;