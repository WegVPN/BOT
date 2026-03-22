# Modern Forum Web Application

A full-featured, modern forum web application built with Next.js, NestJS, PostgreSQL, and Redis.

![Forum Preview](./docs/preview.png)

## 🚀 Features

### User Features
- **Authentication**: Email/password login with JWT tokens
- **OAuth2**: Sign in with Google or GitHub
- **User Profiles**: Avatars, signatures, reputation, and activity stats
- **Forum Structure**: Categories → Forums → Topics → Posts
- **Rich Content**: Markdown support with image/file attachments
- **Interactions**: Like posts, quote replies, subscribe to topics
- **Search**: Full-text search across topics and posts
- **Real-time Notifications**: WebSocket-based live notifications

### Moderator Features
- Close/open topics
- Pin/unpin topics
- Move topics between forums
- Edit/delete any posts
- Warn users
- View moderation logs

### Admin Features
- Dashboard with statistics
- User management (ban, unban, role changes)
- Role and permission management (RBAC)
- Forum and category management
- Site settings configuration
- Media file management
- Moderation logs

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Real-time**: Socket.io Client
- **Markdown**: react-markdown with remark-gfm

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis
- **Real-time**: Socket.io
- **Authentication**: Passport.js (JWT, Google, GitHub)
- **File Storage**: MinIO (S3-compatible)
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI

### DevOps
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Storage**: MinIO

## 📋 Prerequisites

- Node.js 20+
- Docker and Docker Compose
- npm or yarn

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd BOT
```

### 2. Environment Setup

#### Backend Configuration

Copy the example environment file and configure:

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Application
NODE_ENV=development
PORT=3001

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=forum_db
DATABASE_USER=forum_user
DATABASE_PASSWORD=forum_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# MinIO
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=forum-uploads

# OAuth2 (Optional - for social login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

#### Frontend Configuration

Create `.env.local` in the frontend directory:

```bash
cd ../frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
```

### 3. Start with Docker Compose

From the project root:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- Redis cache
- MinIO storage
- Backend API server
- Frontend Next.js app

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Swagger Documentation**: http://localhost:3001/api/docs
- **MinIO Console**: http://localhost:9001 (login: minioadmin / minioadmin)

## 📁 Project Structure

```
BOT/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── entities/       # TypeORM entities
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/       # Authentication
│   │   │   ├── users/      # User management
│   │   │   ├── categories/ # Forum categories
│   │   │   ├── forums/     # Forums
│   │   │   ├── topics/     # Topics
│   │   │   ├── posts/      # Posts
│   │   │   ├── notifications/ # Real-time notifications
│   │   │   └── admin/      # Admin panel
│   │   └── main.ts
│   ├── package.json
│   └── Dockerfile
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities and API client
│   │   ├── stores/        # Zustand stores
│   │   ├── types/         # TypeScript types
│   │   └── styles/        # Global styles
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/github/callback` - GitHub OAuth callback

### Users
- `GET /api/users/me` - Get current user
- `PATCH /api/users/me` - Update profile
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:id/stats` - Get user statistics

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (admin)
- `PATCH /api/categories/:id` - Update category (admin)

### Forums
- `GET /api/forums` - Get all forums
- `GET /api/forums/category/:categoryId` - Get forums by category
- `GET /api/forums/:id` - Get forum by ID
- `POST /api/forums` - Create forum (admin)

### Topics
- `GET /api/topics/forum/:forumId` - Get topics by forum
- `GET /api/topics/:id` - Get topic with posts
- `POST /api/topics` - Create topic
- `PATCH /api/topics/:id` - Update topic (moderator)
- `DELETE /api/topics/:id` - Delete topic (moderator)
- `GET /api/topics/search` - Search topics
- `GET /api/topics/active` - Get active topics

### Posts
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create post
- `PATCH /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like a post
- `POST /api/posts/:id/unlike` - Unlike a post

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users/:id/ban` - Ban user
- `POST /api/admin/users/:id/unban` - Unban user
- `POST /api/admin/topics/:id/close` - Close topic
- `POST /api/admin/topics/:id/pin` - Pin topic

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm run test
npm run test:e2e
```

### Frontend Tests

```bash
cd frontend
npm run test
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Access + Refresh tokens
- **Rate Limiting**: Configurable rate limits on API
- **CORS**: Configured for specific origins
- **Helmet**: Security headers
- **Input Validation**: class-validator on all inputs
- **SQL Injection Protection**: TypeORM parameterized queries
- **XSS Protection**: Content sanitization

## 📊 Database Schema

### Key Entities

- **users**: User accounts with profiles
- **roles**: RBAC roles with permissions
- **categories**: Top-level forum categories
- **forums**: Discussion forums within categories
- **topics**: Discussion topics within forums
- **posts**: Messages within topics
- **private_messages**: Direct messages between users
- **notifications**: User notifications
- **attachments**: File uploads
- **moderation_logs**: Moderation action history

## 🎨 UI Components

The frontend uses custom-styled components based on shadcn/ui:

- Button, Input, Textarea, Label
- Card, Badge, Avatar
- Dropdown Menu, Dialog, Toast
- Markdown editor with preview

## 🌐 Real-time Features

WebSocket connections for:
- Live notifications
- Online user status
- Real-time post updates

## 📝 License

MIT License - feel free to use this project for learning or production.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📧 Support

For issues and questions, please open an issue on GitHub.
