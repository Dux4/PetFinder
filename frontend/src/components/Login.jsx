import React, { useState } from 'react';
import { login } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Login = ({ onBack, onSwitchToRegister }) => {
  const { login: authLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await login(formData);
      authLogin(response.token, response.user);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button onClick={onBack} className="back-button">
          ← Voltar
        </button>
        
        <h2>Entrar no Pet Finder</h2>
        
        <div className="demo-info">
          <p><strong>Usuários de teste:</strong></p>
          <p>📧 maria@email.com | 🔑 123456</p>
          <p>📧 joao@email.com | 🔑 123456</p>
        </div>

        {message && (
          <div className="error-message">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="seu@email.com"
            />
          </div>

          <div className="form-group">
            <label>Senha:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Sua senha"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            Não tem conta? 
            <button onClick={onSwitchToRegister} className="link-button">
              Cadastre-se aqui
            </button>
          </p>
        </div>
      </div>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .auth-card {
          background: white;
          padding: 3rem;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 400px;
          position: relative;
        }

        .back-button {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: none;
          border: none;
          color: #667eea;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
        }

        .auth-card h2 {
          text-align: center;
          color: #333;
          margin-bottom: 2rem;
          font-size: 1.8rem;
        }

        .demo-info {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          text-align: center;
        }

        .demo-info p {
          margin: 0.25rem 0;
          color: #666;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #555;
        }

        .form-group input {
          padding: 1rem;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
        }

        .btn {
          padding: 1rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          text-align: center;
        }

        .auth-switch {
          text-align: center;
          margin-top: 2rem;
          color: #666;
        }

        .link-button {
          background: none;
          border: none;
          color: #667eea;
          cursor: pointer;
          font-weight: 600;
          text-decoration: underline;
          margin-left: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default Login;