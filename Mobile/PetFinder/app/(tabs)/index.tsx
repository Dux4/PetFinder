import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

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
  return (
    <ScrollView style={styles.container}>
      {/* Seção Principal */}
      <View style={styles.mainSection}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>🐾 Pet Finder Salvador</Text>
          <Text style={styles.subtitle}>
            Plataforma colaborativa para encontrar animais perdidos em Salvador
          </Text>
          <Text style={styles.description}>
            Conectamos pessoas que perderam seus pets com quem os encontrou,
            usando a força da comunidade para reunir famílias.
          </Text>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statText}>Pets reunificados</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>1000+</Text>
            <Text style={styles.statText}>Usuários ativos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>163</Text>
            <Text style={styles.statText}>Bairros cobertos</Text>
          </View>
        </View>
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerButton}>
            <Text style={styles.registerButtonText}>Cadastrar-se</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emojiWrapper}>
          <Text style={styles.emoji}>🐕🐱</Text>
        </View>
      </View>

      {/* Seção de Testemunhos */}
      <View style={styles.storiesSection}>
        <Text style={styles.sectionTitleWhite}>Histórias de Sucesso</Text>
        <View style={styles.storiesGrid}>
          {stories.map((story, index) => (
            <View key={index} style={styles.storyCard}>
              <View style={styles.storyHeader}>
                <View style={[styles.emojiCircle, { backgroundColor: story.emoji === '🐕' ? '#FB923C' : '#EC4899' }]}>
                  <Text style={styles.emojiSmall}>{story.emoji}</Text>
                </View>
                <View style={styles.storyTitleContainer}>
                  <Text style={styles.storyTitle}>{story.title}</Text>
                  <Text style={styles.storySubtitle}>{story.subtitle}</Text>
                </View>
              </View>
              <Text style={styles.storyText}>{story.text}</Text>
              <Text style={styles.storyAuthor}>{story.author}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Seção de Bairros Atendidos */}
      <View style={styles.neighborhoodsSection}>
        <Text style={styles.sectionTitleIndigo}>Cobrimos Salvador Inteira</Text>
        <Text style={styles.sectionSubtitleGray}>
          Nossa rede de voluntários está presente em todos os bairros da cidade
        </Text>
        <View style={styles.neighborhoodsGrid}>
          {neighborhoods.map((bairro, index) => (
            <View key={index} style={styles.neighborhoodCard}>
              <Text style={styles.neighborhoodText}>{bairro}</Text>
            </View>
          ))}
        </View>
        <View style={styles.neighborhoodsFooter}>
          <Text style={styles.footerTextGray}>E muitos outros bairros!</Text>
          <View style={styles.statsBadge}>
            <Text style={styles.badgeText}>163 bairros cobertos</Text>
            <Text style={styles.badgeEmoji}>🗺️</Text>
          </View>
        </View>
      </View>

      {/* Seção de Dicas */}
      <View style={styles.tipsSection}>
        <Text style={styles.sectionTitleWhite}>Dicas Importantes</Text>
        <View style={styles.tipsGrid}>
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <View style={[styles.tipIconCircle, { backgroundColor: '#EF4444' }]}>
                <Text style={styles.tipEmoji}>🚨</Text>
              </View>
              <Text style={styles.tipTitle}>Pet Perdido?</Text>
            </View>
            <View>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipItemText}>Poste uma foto clara e recente do seu pet</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipItemText}>Inclua o bairro e pontos de referência</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipItemText}>Descreva características únicas (coleira, cicatrizes, etc.)</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipItemText}>Mantenha o post atualizado</Text>
              </View>
            </View>
          </View>
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <View style={[styles.tipIconCircle, { backgroundColor: '#22C55E' }]}>
                <Text style={styles.tipEmoji}>✅</Text>
              </View>
              <Text style={styles.tipTitle}>Encontrou um Pet?</Text>
            </View>
            <View>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipItemText}>Tire fotos do animal encontrado</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipItemText}>Mantenha o pet em segurança</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipItemText}>Procure por coleiras com identificação</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipItemText}>Poste o local exato onde encontrou</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Seção Como Funciona */}
      <View style={styles.howItWorksSection}>
        <Text style={styles.sectionTitleIndigo}>Como Funciona</Text>
        <View style={styles.howItWorksGrid}>
          <View style={styles.howItWorksCard}>
            <Text style={styles.howItWorksEmoji}>📍</Text>
            <Text style={styles.howItWorksTitle}>Cadastre o Local</Text>
            <Text style={styles.howItWorksText}>Informe o bairro onde o pet foi perdido ou encontrado</Text>
          </View>
          <View style={styles.howItWorksCard}>
            <Text style={styles.howItWorksEmoji}>📸</Text>
            <Text style={styles.howItWorksTitle}>Adicione uma Foto</Text>
            <Text style={styles.howItWorksText}>Uma imagem vale mais que mil palavras na identificação</Text>
          </View>
          <View style={styles.howItWorksCard}>
            <Text style={styles.howItWorksEmoji}>🤝</Text>
            <Text style={styles.howItWorksTitle}>Conecte-se</Text>
            <Text style={styles.howItWorksText}>A comunidade te ajuda a encontrar ou devolver o pet</Text>
          </View>
        </View>
      </View>

      {/* Call to Action Final */}
      <View style={styles.ctaSection}>
        <View style={styles.ctaWrapper}>
          <Text style={styles.ctaTitle}>Faça Parte da Nossa Comunidade</Text>
          <Text style={styles.ctaSubtitle}>
            Juntos, podemos reunir mais famílias com seus pets queridos
          </Text>
          <View style={styles.ctaButtons}>
            <TouchableOpacity style={styles.ctaButtonPrimary}>
              <Text style={styles.ctaButtonPrimaryText}>Começar Agora 🚀</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctaButtonSecondary}>
              <Text style={styles.ctaButtonSecondaryText}>Já tenho conta</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.ctaInfo}>
            <View style={styles.ctaInfoItem}>
              <Text style={styles.ctaInfoEmoji}>📱</Text>
              <Text style={styles.ctaInfoText}>App móvel em breve</Text>
            </View>
            <View style={styles.ctaInfoItem}>
              <Text style={styles.ctaInfoEmoji}>🔒</Text>
              <Text style={styles.ctaInfoText}>100% gratuito e seguro</Text>
            </View>
            <View style={styles.ctaInfoItem}>
              <Text style={styles.ctaInfoEmoji}>⚡</Text>
              <Text style={styles.ctaInfoText}>Resultados rápidos</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6D28D9',
  },
  mainSection: {
    paddingHorizontal: 32,
    paddingVertical: 64,
    justifyContent: 'center',
    minHeight: Dimensions.get('window').height,
    backgroundColor: '#4C1D95',
  },
  textContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 8,
    opacity: 0.9,
  },
  description: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
    opacity: 0.8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  statCard: {
    flex: 1,
    textAlign: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  statText: {
    fontSize: 12,
    opacity: 0.8,
    color: '#fff',
    textAlign: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
    justifyContent: 'center',
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 9999,
  },
  buttonText: {
    color: '#4C1D95',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  registerButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: '#fff',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emojiWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  emoji: {
    fontSize: 120,
  },
  storiesSection: {
    backgroundColor: '#6D28D9',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  sectionTitleWhite: {
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 48,
    color: '#fff',
  },
  storiesGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  storyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 24,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  emojiCircle: {
    width: 48,
    height: 48,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiSmall: {
    fontSize: 24,
  },
  storyTitleContainer: {
    marginLeft: 16,
  },
  storyTitle: {
    fontWeight: 'bold',
    color: '#fff',
  },
  storySubtitle: {
    fontSize: 12,
    opacity: 0.8,
    color: '#fff',
  },
  storyText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
    color: '#fff',
  },
  storyAuthor: {
    fontSize: 12,
    marginTop: 12,
    opacity: 0.7,
    color: '#fff',
  },
  neighborhoodsSection: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  sectionTitleIndigo: {
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#4F46E5',
  },
  sectionSubtitleGray: {
    textAlign: 'center',
    color: '#4B5563',
    marginBottom: 48,
    fontSize: 16,
  },
  neighborhoodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 48,
  },
  neighborhoodCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  neighborhoodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  neighborhoodsFooter: {
    textAlign: 'center',
    alignItems: 'center',
  },
  footerTextGray: {
    color: '#4B5563',
    marginBottom: 16,
  },
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 9999,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  badgeText: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  badgeEmoji: {
    marginLeft: 8,
    fontSize: 24,
  },
  tipsSection: {
    backgroundColor: '#4C1D95',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  tipsGrid: {
    flexDirection: 'column',
    gap: 32,
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  tipIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tipEmoji: {
    fontSize: 24,
  },
  tipTitle: {
    marginLeft: 16,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    color: '#4F46E5',
    marginRight: 12,
    fontWeight: 'bold',
    fontSize: 18,
  },
  tipItemText: {
    lineHeight: 24,
    color: '#374151',
    flexShrink: 1,
  },
  howItWorksSection: {
    backgroundColor: '#fff',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  howItWorksGrid: {
    flexDirection: 'column',
    gap: 48,
  },
  howItWorksCard: {
    textAlign: 'center',
    padding: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 6.27,
    elevation: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  howItWorksEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  howItWorksTitle: {
    color: '#4F46E5',
    marginBottom: 16,
    fontSize: 20,
    fontWeight: 'bold',
  },
  howItWorksText: {
    color: '#4B5563',
    lineHeight: 24,
    textAlign: 'center',
  },
  ctaSection: {
    backgroundColor: '#581C87',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  ctaWrapper: {
    textAlign: 'center',
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#fff',
  },
  ctaSubtitle: {
    fontSize: 20,
    marginBottom: 32,
    opacity: 0.9,
    color: '#fff',
    textAlign: 'center',
  },
  ctaButtons: {
    flexDirection: 'column',
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  ctaButtonPrimary: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 9999,
  },
  ctaButtonPrimaryText: {
    color: '#581C87',
    fontSize: 20,
    fontWeight: 'bold',
  },
  ctaButtonSecondary: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 9999,
  },
  ctaButtonSecondaryText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  ctaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    opacity: 0.8,
    flexWrap: 'wrap',
    gap: 10,
  },
  ctaInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 150,
    justifyContent: 'center',
  },
  ctaInfoEmoji: {
    marginRight: 8,
  },
  ctaInfoText: {
    fontSize: 14,
    color: '#fff',
  },
});

export default LandingPage;