import React from 'react';

const LandingPage = ({ onLogin, onRegister }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 px-8 py-16 max-w-6xl mx-auto items-center min-h-[80vh]">
        <div className="lg:text-left">
          <h1 className="text-6xl font-bold mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            🐾 Pet Finder Salvador
          </h1>
          <p className="text-2xl mb-4 opacity-90">
            Plataforma colaborativa para encontrar animais perdidos em Salvador
          </p>
          <p className="text-lg leading-relaxed mb-8 opacity-80">
            Conectamos pessoas que perderam seus pets com quem os encontrou, 
            usando a força da comunidade para reunir famílias.
          </p>
          
          <div className="grid grid-cols-3 gap-8 my-8">
            <div className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-[10px]">
              <div className="text-3xl font-bold block mb-2">500+</div>
              <span className="text-sm opacity-80">Pets reunificados</span>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-[10px]">
              <div className="text-3xl font-bold block mb-2">1000+</div>
              <span className="text-sm opacity-80">Usuários ativos</span>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-[10px]">
              <div className="text-3xl font-bold block mb-2">163</div>
              <span className="text-sm opacity-80">Bairros cobertos</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8 items-center lg:items-start lg:justify-start justify-center">
            <button 
              onClick={onLogin} 
              className="px-8 py-4 bg-white text-indigo-500 rounded-full text-lg font-semibold cursor-pointer transition-all duration-300 min-w-[150px] hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(255,255,255,0.3)] hover:scale-105"
            >
              Entrar
            </button>
            <button 
              onClick={onRegister} 
              className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-full text-lg font-semibold cursor-pointer transition-all duration-300 min-w-[150px] hover:bg-white hover:text-indigo-500 hover:-translate-y-1 hover:scale-105"
            >
              Cadastrar-se
            </button>
          </div>
        </div>

        <div className="flex justify-center items-center">
          <div className="text-[15rem]" style={{
            textShadow: '0 0 50px rgba(255,255,255,0.3)',
            animation: 'float 3s ease-in-out infinite'
          }}>
            🐕🐱
          </div>
        </div>
      </div>

      {/* Seção de Testemunhos */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-4xl font-bold mb-12 text-white">
            Histórias de Sucesso
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center text-2xl">
                  🐕
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">Max encontrado!</h4>
                  <p className="text-sm opacity-80">Barra - Salvador</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed opacity-90">
                "Perdi meu Max na praia da Barra. Em 2 dias, alguém postou aqui que tinha encontrado ele. A plataforma salvou minha família!"
              </p>
              <p className="text-xs mt-3 opacity-70">- Maria Santos</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-pink-400 rounded-full flex items-center justify-center text-2xl">
                  🐱
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">Luna voltou pra casa</h4>
                  <p className="text-sm opacity-80">Pituba - Salvador</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed opacity-90">
                "Minha gata Luna fugiu durante uma mudança. Graças à comunidade do Pet Finder, ela foi encontrada em apenas 1 dia!"
              </p>
              <p className="text-xs mt-3 opacity-70">- João Silva</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-2xl">
                  🐕
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">Buddy reunificado</h4>
                  <p className="text-sm opacity-80">Ondina - Salvador</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed opacity-90">
                "Encontrei um cão perdido e postei aqui. Em poucas horas, a dona entrou em contato. Ver a alegria dela foi emocionante!"
              </p>
              <p className="text-xs mt-3 opacity-70">- Ana Costa</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Bairros Atendidos */}
      <div className="bg-gray-50 py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-4xl font-bold mb-4 text-indigo-600">
            Cobrimos Salvador Inteira
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Nossa rede de voluntários está presente em todos os bairros da cidade
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
            {[
              'Barra', 'Ondina', 'Rio Vermelho', 'Pituba', 'Itapuã', 'Stella Maris',
              'Amaralina', 'Costa Azul', 'Armação', 'Pituaçu', 'Patamares', 'Vilas do Atlântico',
              'Pelourinho', 'Terreiro de Jesus', 'Largo do Carmo', 'Santo Antônio', 'Barris', 'Graça',
              'Vitória', 'Canela', 'Bonfim', 'Mont Serrat', 'Boa Viagem', 'Ribeira'
            ].map((bairro, index) => (
              <div key={index} className="bg-white rounded-lg p-3 text-center shadow-sm border hover:shadow-md transition-shadow">
                <span className="text-sm font-medium text-gray-700">{bairro}</span>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-4">E muitos outros bairros!</p>
            <div className="inline-flex items-center bg-indigo-100 rounded-full px-6 py-3">
              <span className="text-indigo-600 font-semibold">163 bairros cobertos</span>
              <span className="ml-2 text-2xl">🗺️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Dicas - MELHORADA */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-4xl font-bold mb-12 text-white">
            Dicas Importantes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-xl">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-3xl shadow-lg">
                  🚨
                </div>
                <h3 className="ml-4 text-2xl font-bold text-gray-800">Pet Perdido?</h3>
              </div>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">Poste uma foto clara e recente do seu pet</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">Inclua o bairro e pontos de referência</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">Descreva características únicas (coleira, cicatrizes, etc.)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">Mantenha o post atualizado</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">Compartilhe nas redes sociais</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-xl">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-3xl shadow-lg">
                  ✅
                </div>
                <h3 className="ml-4 text-2xl font-bold text-gray-800">Encontrou um Pet?</h3>
              </div>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">Tire fotos do animal encontrado</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">Mantenha o pet em segurança</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">Procure por coleiras com identificação</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">Poste o local exato onde encontrou</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-3 font-bold text-lg">•</span>
                  <span className="leading-relaxed">Seja paciente para verificar a identidade do dono</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>


      <div className="bg-white text-gray-800 py-16 px-8">
        <h2 className="text-center text-4xl font-bold mb-12 text-indigo-500">
          Como Funciona
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-5xl mx-auto">
          <div className="text-center p-8 rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-2 bg-white">
            <div className="text-6xl mb-4">📍</div>
            <h3 className="text-indigo-500 mb-4 text-xl font-bold">Cadastre o Local</h3>
            <p className="text-gray-600 leading-relaxed">
              Informe o bairro onde o pet foi perdido ou encontrado
            </p>
          </div>
          <div className="text-center p-8 rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-2 bg-white">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-indigo-500 mb-4 text-xl font-bold">Adicione uma Foto</h3>
            <p className="text-gray-600 leading-relaxed">
              Uma imagem vale mais que mil palavras na identificação
            </p>
          </div>
          <div className="text-center p-8 rounded-xl shadow-lg transition-transform duration-300 hover:-translate-y-2 bg-white">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-indigo-500 mb-4 text-xl font-bold">Conecte-se</h3>
            <p className="text-gray-600 leading-relaxed">
              A comunidade te ajuda a encontrar ou devolver o pet
            </p>
          </div>
        </div>
      </div>
        {/* Call to Action Final */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-700 py-16 px-8">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-6">
              Faça Parte da Nossa Comunidade
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Juntos, podemos reunir mais famílias com seus pets queridos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <button 
                onClick={onRegister}
                className="px-10 py-4 bg-white text-purple-700 rounded-full text-xl font-bold cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_25px_rgba(255,255,255,0.3)] hover:scale-105"
              >
                Começar Agora 🚀
              </button>
              <button 
                onClick={onLogin}
                className="px-10 py-4 bg-transparent text-white border-2 border-white rounded-full text-xl font-bold cursor-pointer transition-all duration-300 hover:bg-white hover:text-purple-700 hover:-translate-y-1 hover:scale-105"
              >
                Já tenho conta
              </button>
            </div>
            <div className="flex items-center justify-center space-x-8 text-sm opacity-80">
              <div className="flex items-center">
                <span className="mr-2">📱</span>
                <span>App móvel em breve</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">🔒</span>
                <span>100% gratuito e seguro</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">⚡</span>
                <span>Resultados rápidos</span>
              </div>
            </div>
          </div>
        </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;