const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🐾 Pet Finder Salvador - Servidor (PostgreSQL) rodando na porta ${PORT}`);
  console.log(`🌐 Acesse: http://localhost:${PORT}/api/health`);
});
