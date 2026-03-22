# 🚀 Deployment Guide

## Вариант 1: GitHub Pages (Frontend) + Backend на другом хостинге

### Шаг 1: Разместите Backend

Backend должен быть размещён на отдельном хостинге с поддержкой Node.js:

**Рекомендуемые хостинги для backend:**
- [Railway](https://railway.app) - бесплатно с ограничениями
- [Render](https://render.com) - есть бесплатный тариф
- [Fly.io](https://fly.io) - бесплатно до 3 VM
- [Heroku](https://heroku.com) - платно

#### Deploy на Railway:

```bash
# Установите Railway CLI
npm install -g @railway/cli

# Login
railway login

# Инициализируйте проект
cd backend
railway init

# Добавьте PostgreSQL
railway add postgres

# Добавьте Redis
railway add redis

# Задеплойте
railway up
```

После деплоя Railway предоставит URL вида: `https://your-app.railway.app`

### Шаг 2: Настройте GitHub Pages для Frontend

1. **В GitHub Repository перейдите в Settings → Pages**

2. **В разделе "Build and deployment":**
   - Source: **GitHub Actions**

3. **Добавьте переменную окружения:**
   - Settings → Actions → Variables → New repository variable
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-backend-url.railway.app` (URL вашего backend)

4. **Запустите workflow:**
   - Перейдите в Actions → "Deploy to GitHub Pages" → Run workflow

5. **После успешного деплоя:**
   - Ваш сайт будет доступен по URL: `https://your-username.github.io/BOT/`

---

## Вариант 2: Vercel (Frontend) + Railway (Backend)

### Frontend на Vercel:

```bash
cd frontend

# Установите Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# В дашборде Vercel добавьте переменную окружения:
# NEXT_PUBLIC_API_URL = https://your-backend.railway.app
```

### Backend на Railway:

См. инструкцию выше.

---

## Вариант 3: Render.com (Всё в одном)

1. **Зарегистрируйтесь на [Render](https://render.com)**

2. **Создайте новый Blueprint:**
   ```bash
   # В дашборде Render выберите "New Blueprint"
   # Подключите ваш GitHub репозиторий
   ```

3. **Render автоматически прочитает `render.yaml` и создаст:**
   - Web Service для backend
   - Web Service для frontend
   - PostgreSQL базу данных
   - Redis кэш

---

## Вариант 4: Docker Compose (VPS)

Для развёртывания на собственном VPS:

```bash
# Скопируйте репозиторий на сервер
git clone https://github.com/your-username/BOT.git
cd BOT

# Настройте .env файлы
cp backend/.env.example backend/.env
# Отредактируйте backend/.env

# Запустите через Docker Compose
docker-compose up -d

# Приложение доступно на:
# Frontend: http://your-server-ip:3000
# Backend: http://your-server-ip:3001
```

---

## Настройка OAuth (Google, GitHub)

### Google OAuth:

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com)
2. Создайте новый проект
3. APIs & Services → Credentials → Create Credentials → OAuth Client ID
4. Application type: **Web application**
5. Authorized redirect URIs:
   - `https://your-backend-url.com/api/auth/google/callback`
6. Скопируйте Client ID и Client Secret в `.env`

### GitHub OAuth:

1. Перейдите в [GitHub Settings](https://github.com/settings/developers)
2. OAuth Apps → New OAuth App
3. Application name: **Forum**
4. Homepage URL: `https://your-frontend-url.com`
5. Authorization callback URL:
   - `https://your-backend-url.com/api/auth/github/callback`
6. Скопируйте Client ID и создайте Client Secret

---

## Переменные окружения для Production

### Backend (.env):

```env
NODE_ENV=production
PORT=3001

# Database (Railway/Render предоставят эти значения)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis
REDIS_URL=redis://host:6379

# JWT (сгенерируйте случайные строки)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_REFRESH_EXPIRES_IN=7d

# MinIO (или используйте AWS S3)
MINIO_ENDPOINT=s3.amazonaws.com
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET=forum-uploads
MINIO_USE_SSL=true

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Frontend URL
FRONTEND_URL=https://your-username.github.io
```

### Frontend:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

---

## Проверка после деплоя

1. ✅ Frontend загружается
2. ✅ Backend отвечает на `/api/health`
3. ✅ Регистрация работает
4. ✅ OAuth (Google/GitHub) работает
5. ✅ Создание тем и постов работает
6. ✅ Файлы загружаются в MinIO/S3
7. ✅ WebSocket уведомления работают

---

## Troubleshooting

### Ошибка CORS:
Убедитесь, что `FRONTEND_URL` в backend `.env` правильный.

### Ошибка 404 на GitHub Pages:
Убедитесь, что `output: 'export'` в `next.config.js` и переменная `NEXT_PUBLIC_API_URL` установлена.

### WebSocket не работает:
Проверьте, что ваш хостинг поддерживает WebSocket соединения.

---

## Ссылки

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vercel Deployment](https://vercel.com/docs/deployments)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
