import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

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

const SuccessStories = () => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Histórias de Sucesso</Text>
      <View style={styles.storiesGrid}>
        {stories.map((story, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.emojiCircle, { backgroundColor: story.emoji === '🐕' ? '#FB923C' : '#EC4899' }]}>
                <Text style={styles.emoji}>{story.emoji}</Text>
              </View>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardTitle}>{story.title}</Text>
                <Text style={styles.cardSubtitle}>{story.subtitle}</Text>
              </View>
            </View>
            <Text style={styles.cardText}>{story.text}</Text>
            <Text style={styles.cardAuthor}>{story.author}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    paddingVertical: 64, // py-16
    paddingHorizontal: 32, // px-8
    backgroundColor: '#6D28D9', // from-purple-600
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 48, // mb-12
    color: '#fff',
  },
  storiesGrid: {
    // Usamos Flexbox para criar o layout de colunas.
    // Em mobile, a exibição de 3 colunas pode não ser ideal,
    // então aqui usamos apenas uma coluna por padrão.
    // Pode ser ajustado para usar 2 colunas dependendo do design.
    flexDirection: 'column',
    gap: 16, // Espaçamento entre os cards.
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // bg-white/10
    borderRadius: 12, // rounded-xl
    padding: 24, // p-6
    backdropFilter: 'blur(4px)', // Não é nativo, precisa de uma biblioteca, mas vamos simular.
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, // mb-4
  },
  emojiCircle: {
    width: 48, // w-12
    height: 48, // h-12
    borderRadius: 9999, // rounded-full
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24, // text-2xl
  },
  cardTitleContainer: {
    marginLeft: 16, // ml-4
  },
  cardTitle: {
    fontWeight: 'bold',
    color: '#fff',
  },
  cardSubtitle: {
    fontSize: 12, // text-sm
    opacity: 0.8,
    color: '#fff',
  },
  cardText: {
    fontSize: 14, // text-sm
    lineHeight: 20, // leading-relaxed
    opacity: 0.9,
    color: '#fff',
  },
  cardAuthor: {
    fontSize: 12, // text-xs
    marginTop: 12, // mt-3
    opacity: 0.7,
    color: '#fff',
  },
});

export default SuccessStories;