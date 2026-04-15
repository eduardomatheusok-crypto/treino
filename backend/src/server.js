import dotenv from 'dotenv';
import app from './app.js';
import { connectDatabase } from './config/db.js';

dotenv.config();

const port = process.env.PORT || 4000;

async function bootstrap() {
  try {
    await connectDatabase();

    app.listen(port, () => {
      console.log(`Servidor backend rodando em http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error.message);
    process.exit(1);
  }
}
bootstrap();