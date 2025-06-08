import React, { useState } from 'react';
import { register } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Register = ({ onBack, onSwitchToLogin }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setMessage('As senhas não coincidem');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { confirmPassword, ...submitData } = formData;
      const response = await register(submitData);
      login(response.token, response.user);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Erro ao criar conta');
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
        
        <h2>Criar Conta</h2>

        {message && (
          <div className={message.includes('sucesso') ? 'success-message' : 'error-message'}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Nome Completo:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Seu nome completo"
            />
          </div>

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
            <label>Telefone:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              placeholder="(71) 99999-9999"
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
              placeholder="Mínimo 6 caracteres"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>Confirmar Senha:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              placeholder="Digite a senha novamente"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            Já tem conta? 
            <button onClick={onSwitchToLogin} className="link-button">
              Faça login aqui
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
          max-width: 450px;
          position: relative;
          max-height: 90vh;
          overflow-y: auto;
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

        .success-message {
          background: #dcfce7;
          color: #16a34a;
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

export default Register;