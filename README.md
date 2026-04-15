# Gym Tracker (Mobile-First)

Aplicacao web para criacao de multiplos treinos por usuario, registro de series e acompanhamento de evolucao por exercicio com comparacao automatica.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Banco: MongoDB Atlas (Mongoose)

## Estrutura

- `backend/src/models`: schemas de usuario, treino e historico
- `backend/src/services/comparisonService.js`: regras de evolucao/regressao
- `backend/src/controllers` e `backend/src/routes`: API REST em camadas
- `frontend/src/components`: UI mobile-first
- `frontend/src/services/api.js`: cliente REST

## Regras de comparacao implementadas

Comparacao com o treino anterior do mesmo exercicio (mesmo usuario + mesmo treino):

- Carga maior: progresso
- Repeticoes maiores: progresso
- Carga menor: regressao
- Repeticoes menores: regressao
- Carga maior e rep menor: parcial_carga (destaca carga)
- Carga menor e rep maior: parcial_repeticoes (destaca repeticoes)
- Ambos menores: regressao_total

Cada exercicio salva:

- diferenca numerica de carga (`diffWeightKg`)
- diferenca numerica de repeticoes (`diffReps`)
- status para indicador visual

## Como executar

### 1) Backend

1. Entre em `backend`
2. Instale dependencias: `npm install`
3. Copie `.env.example` para `.env`
4. Configure `MONGODB_URI` com seu cluster Atlas
5. Rode: `npm run dev`

Servidor: `http://localhost:4000`

### 2) Frontend

1. Entre em `frontend`
2. Instale dependencias: `npm install`
3. Copie `.env.example` para `.env`
4. Rode: `npm run dev`

Aplicacao: `http://localhost:5173`

## Endpoints principais

- `GET /api/users/demo` -> cria/retorna usuario demo
- `POST /api/users` -> cria usuario
- `GET /api/users/:userId/workouts` -> lista treinos
- `POST /api/users/:userId/workouts` -> cria treino
- `GET /api/users/:userId/workouts/:workoutId/entries` -> historico por treino
- `POST /api/users/:userId/workouts/:workoutId/entries` -> registra treino do dia

## Observacao

Nao rodei `npm install` nem os servidores aqui, pois depende de acesso de rede e credenciais do Atlas no ambiente local.

## Deploy em producao (Render + Vercel)

### 1) Publicar o backend no Render

1. Suba este projeto para um repositorio no GitHub
2. Acesse o Render e clique em **New +** -> **Blueprint**
3. Selecione o repositorio (o arquivo `render.yaml` sera detectado automaticamente)
4. No servico `gym-tracker-backend`, configure:
   - `MONGODB_URI`: string do MongoDB Atlas
   - `FRONTEND_URL`: URL da Vercel (ex.: `https://seu-front.vercel.app`)
5. Finalize o deploy e copie a URL do backend (ex.: `https://gym-tracker-backend.onrender.com`)

### 2) Conectar o frontend na Vercel

No projeto da Vercel, em **Settings -> Environment Variables**, adicione:

- `VITE_API_URL=https://sua-api.onrender.com/api`

Depois, faça um novo deploy do frontend.

### 3) Teste final

1. Abra `https://sua-api.onrender.com/api/health` e confirme `{"status":"ok"}`
2. Abra o front na Vercel e valide criacao de treino e registro de entrada

### 4) Seguranca importante

A string de conexao atual do MongoDB foi exposta no arquivo `.env` local. Recomendo:

1. Trocar a senha do usuario do Atlas imediatamente
2. Gerar uma nova `MONGODB_URI`
3. Atualizar a variavel no Render e no `.env` local
