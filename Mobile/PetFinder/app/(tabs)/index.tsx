import React from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
// import "../global.css";

const stories = [
  {
    emoji: '🐕',
    title: 'Max encontrado!',
    subtitle: 'Barra - Salvador',
    text: '"Perdi meu Max na praia da Barra. Em 2 dias, alguém postou aqui que tinha encontrado ele. A plataforma salvou minha família!"',
    author: '- Maria Santos',
  },
  {
    emoji: '🐱',
    title: 'Luna voltou pra casa',
    subtitle: 'Pituba - Salvador',
    text: '"Minha gata Luna fugiu durante uma mudança. Graças à comunidade do Pet Finder, ela foi encontrada em apenas 1 dia!"',
    author: '- João Silva',
  },
  {
    emoji: '🐕',
    title: 'Buddy reunificado',
    subtitle: 'Ondina - Salvador',
    text: '"Encontrei um cão perdido e postei aqui. Em poucas horas, a dona entrou em contato. Ver a alegria dela foi emocionante!"',
    author: '- Ana Costa',
  },
];

const neighborhoods = [
  'Barra', 'Ondina', 'Rio Vermelho', 'Pituba', 'Itapuã', 'Stella Maris',
  'Amaralina', 'Costa Azul', 'Armação', 'Pituaçu', 'Patamares', 'Vilas do Atlântico',
  'Pelourinho', 'Terreiro de Jesus', 'Largo do Carmo', 'Santo Antônio', 'Barris', 'Graça',
  'Vitória', 'Canela', 'Bonfim', 'Mont Serrat', 'Boa Viagem', 'Ribeira'
];

const LandingPage = () => {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-purple-700">
      {/* Hero Section */}
      <View className="px-8 py-16 justify-center min-h-screen bg-purple-900">
        <View className="mb-6">
          <Text className="text-5xl font-bold text-white mb-2">🐾 Pet Finder Salvador</Text>
          <Text className="text-xl text-white/90 mb-2">
            Plataforma colaborativa para encontrar animais perdidos em Salvador
          </Text>
          <Text className="text-base text-white/80 mb-4">
            Conectamos pessoas que perderam seus pets com quem os encontrou,
            usando a força da comunidade para reunir famílias.
          </Text>
        </View>

        {/* Stats Grid */}
        <View className="flex-row justify-between my-4">
          <View className="flex-1 text-center p-4 bg-white/10 rounded-xl mx-1">
            <Text className="text-2xl font-bold text-white mb-2 text-center">500+</Text>
            <Text className="text-sm text-white/80 text-center">Pets reunificados</Text>
          </View>
          <View className="flex-1 text-center p-4 bg-white/10 rounded-xl mx-1">
            <Text className="text-2xl font-bold text-white mb-2 text-center">1000+</Text>
            <Text className="text-sm text-white/80 text-center">Usuários ativos</Text>
          </View>
          <View className="flex-1 text-center p-4 bg-white/10 rounded-xl mx-1">
            <Text className="text-2xl font-bold text-white mb-2 text-center">163</Text>
            <Text className="text-sm text-white/80 text-center">Bairros cobertos</Text>
          </View>
        </View>

        {/* Buttons */}
        <View className="flex-row gap-4 mt-4 justify-center">
          <TouchableOpacity 
            className="bg-white px-8 py-4 rounded-full"
            onPress={() => router.push('/login')}
          >
            <Text className="text-purple-900 text-lg font-bold text-center">Entrar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-transparent px-8 py-4 rounded-full border-2 border-white"
            onPress={() => router.push('/register')}
          >
            <Text className="text-white text-lg font-bold text-center">Cadastrar-se</Text>
          </TouchableOpacity>
        </View>

        {/* Emoji */}
        <View className="items-center justify-center mt-8">
          <Text className="text-[120px]">🐕🐱</Text>
        </View>
      </View>

      {/* Success Stories Section */}
      <View className="bg-purple-700 py-16 px-8">
        <Text className="text-center text-4xl font-bold text-white mb-12">
          Histórias de Sucesso
        </Text>
        <View className="flex-col gap-4">
          {stories.map((story, index) => (
            <View key={index} className="bg-white/10 rounded-xl p-6">
              <View className="flex-row items-center mb-4">
                <View className={`w-12 h-12 rounded-full items-center justify-center ${
                  story.emoji === '🐕' ? 'bg-orange-400' : 'bg-pink-500'
                }`}>
                  <Text className="text-2xl">{story.emoji}</Text>
                </View>
                <View className="ml-4">
                  <Text className="font-bold text-white">{story.title}</Text>
                  <Text className="text-sm text-white/80">{story.subtitle}</Text>
                </View>
              </View>
              <Text className="text-sm leading-5 text-white/90 mb-3">{story.text}</Text>
              <Text className="text-xs text-white/70">{story.author}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Neighborhoods Section */}
      <View className="bg-gray-50 py-16 px-8">
        <Text className="text-center text-4xl font-bold text-indigo-600 mb-4">
          Cobrimos Salvador Inteira
        </Text>
        <Text className="text-center text-gray-600 mb-12 text-base">
          Nossa rede de voluntários está presente em todos os bairros da cidade
        </Text>
        <View className="flex-row flex-wrap justify-center gap-4 mb-12">
          {neighborhoods.map((bairro, index) => (
            <View key={index} className="bg-white rounded-lg px-3 py-2 shadow-sm">
              <Text className="text-sm font-medium text-gray-600">{bairro}</Text>
            </View>
          ))}
        </View>
        <View className="text-center items-center">
          <Text className="text-gray-600 mb-4">E muitos outros bairros!</Text>
          <View className="flex-row items-center bg-indigo-50 rounded-full px-6 py-3">
            <Text className="text-indigo-600 font-semibold">163 bairros cobertos</Text>
            <Text className="ml-2 text-2xl">🗺️</Text>
          </View>
        </View>
      </View>

      {/* Tips Section */}
      <View className="bg-purple-900 py-16 px-8">
        <Text className="text-center text-4xl font-bold text-white mb-12">
          Dicas Importantes
        </Text>
        <View className="flex-col gap-8">
          {/* Lost Pet Card */}
          <View className="bg-white rounded-2xl p-8 shadow-lg">
            <View className="flex-row items-center mb-6">
              <View className="w-16 h-16 bg-red-500 rounded-full items-center justify-center shadow-lg">
                <Text className="text-2xl">🚨</Text>
              </View>
              <Text className="ml-4 text-xl font-bold text-gray-800">Pet Perdido?</Text>
            </View>
            <View>
              <View className="flex-row items-start mb-2">
                <Text className="text-indigo-600 font-bold text-lg mr-3">•</Text>
                <Text className="text-gray-700 leading-6 flex-shrink">
                  Poste uma foto clara e recente do seu pet
                </Text>
              </View>
              <View className="flex-row items-start mb-2">
                <Text className="text-indigo-600 font-bold text-lg mr-3">•</Text>
                <Text className="text-gray-700 leading-6 flex-shrink">
                  Inclua o bairro e pontos de referência
                </Text>
              </View>
              <View className="flex-row items-start mb-2">
                <Text className="text-indigo-600 font-bold text-lg mr-3">•</Text>
                <Text className="text-gray-700 leading-6 flex-shrink">
                  Descreva características únicas (coleira, cicatrizes, etc.)
                </Text>
              </View>
              <View className="flex-row items-start">
                <Text className="text-indigo-600 font-bold text-lg mr-3">•</Text>
                <Text className="text-gray-700 leading-6 flex-shrink">
                  Mantenha o post atualizado
                </Text>
              </View>
            </View>
          </View>

          {/* Found Pet Card */}
          <View className="bg-white rounded-2xl p-8 shadow-lg">
            <View className="flex-row items-center mb-6">
              <View className="w-16 h-16 bg-green-500 rounded-full items-center justify-center shadow-lg">
                <Text className="text-2xl">✅</Text>
              </View>
              <Text className="ml-4 text-xl font-bold text-gray-800">Encontrou um Pet?</Text>
            </View>
            <View>
              <View className="flex-row items-start mb-2">
                <Text className="text-indigo-600 font-bold text-lg mr-3">•</Text>
                <Text className="text-gray-700 leading-6 flex-shrink">
                  Tire fotos do animal encontrado
                </Text>
              </View>
              <View className="flex-row items-start mb-2">
                <Text className="text-indigo-600 font-bold text-lg mr-3">•</Text>
                <Text className="text-gray-700 leading-6 flex-shrink">
                  Mantenha o pet em segurança
                </Text>
              </View>
              <View className="flex-row items-start mb-2">
                <Text className="text-indigo-600 font-bold text-lg mr-3">•</Text>
                <Text className="text-gray-700 leading-6 flex-shrink">
                  Procure por coleiras com identificação
                </Text>
              </View>
              <View className="flex-row items-start">
                <Text className="text-indigo-600 font-bold text-lg mr-3">•</Text>
                <Text className="text-gray-700 leading-6 flex-shrink">
                  Poste o local exato onde encontrou
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* How It Works Section */}
      <View className="bg-white py-16 px-8">
        <Text className="text-center text-4xl font-bold text-indigo-600 mb-12">
          Como Funciona
        </Text>
        <View className="flex-col gap-12">
          <View className="bg-white rounded-2xl p-8 shadow-xl text-center items-center">
            <Text className="text-5xl mb-4">📍</Text>
            <Text className="text-xl font-bold text-indigo-600 mb-4">Cadastre o Local</Text>
            <Text className="text-gray-600 leading-6 text-center">
              Informe o bairro onde o pet foi perdido ou encontrado
            </Text>
          </View>
          <View className="bg-white rounded-2xl p-8 shadow-xl text-center items-center">
            <Text className="text-5xl mb-4">📸</Text>
            <Text className="text-xl font-bold text-indigo-600 mb-4">Adicione uma Foto</Text>
            <Text className="text-gray-600 leading-6 text-center">
              Uma imagem vale mais que mil palavras na identificação
            </Text>
          </View>
          <View className="bg-white rounded-2xl p-8 shadow-xl text-center items-center">
            <Text className="text-5xl mb-4">🤝</Text>
            <Text className="text-xl font-bold text-indigo-600 mb-4">Conecte-se</Text>
            <Text className="text-gray-600 leading-6 text-center">
              A comunidade te ajuda a encontrar ou devolver o pet
            </Text>
          </View>
        </View>
      </View>

      {/* CTA Section */}
      <View className="bg-purple-950 py-16 px-8">
        <View className="text-center items-center">
          <Text className="text-4xl font-bold text-white mb-6 text-center">
            Faça Parte da Nossa Comunidade
          </Text>
          <Text className="text-xl text-white/90 mb-8 text-center">
            Juntos, podemos reunir mais famílias com seus pets queridos
          </Text>
          <View className="flex-col gap-4 items-center mb-8">
            <TouchableOpacity className="px-10 py-4 bg-white rounded-full">
              <Text className="text-purple-950 text-xl font-bold">Começar Agora 🚀</Text>
            </TouchableOpacity>
            <TouchableOpacity className="px-10 py-4 bg-transparent rounded-full border-2 border-white">
              <Text className="text-white text-xl font-bold">Já tenho conta</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-center flex-wrap gap-6 w-full opacity-80">
            <View className="flex-row items-center gap-2 min-w-[150px] justify-center">
              <Text className="text-base">📱</Text>
              <Text className="text-sm text-white">App móvel em breve</Text>
            </View>
            <View className="flex-row items-center gap-2 min-w-[150px] justify-center">
              <Text className="text-base">🔒</Text>
              <Text className="text-sm text-white">100% gratuito e seguro</Text>
            </View>
            <View className="flex-row items-center gap-2 min-w-[150px] justify-center">
              <Text className="text-base">⚡</Text>
              <Text className="text-sm text-white">Resultados rápidos</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default LandingPage;