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