# Ipiranga Fitness - Sistema Completo de Website

Sistema completo para gerenciamento do site institucional e catálogo de equipamentos da Ipiranga Fitness, desenvolvido com arquitetura profissional e escalável.

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** + **Express.js** - API REST
- **MySQL** - Banco de dados relacional
- **JWT** - Autenticação segura
- **Multer** + **Sharp** - Upload e processamento de imagens
- **Joi** - Validação de dados
- **bcrypt** - Hash de senhas

### Frontend
- **Next.js 14** - Framework React com SSR
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações
- **Zustand** - Gerenciamento de estado
- **React Hook Form** + **Zod** - Formulários

## 📁 Estrutura do Projeto

```
ipiranga-fitness-site/
├── backend/
│   ├── src/
│   │   ├── config/         # Configurações (DB, migrations, seeds)
│   │   ├── controllers/    # Controladores das rotas
│   │   ├── middleware/     # Middlewares (auth, upload)
│   │   ├── models/         # Modelos do banco de dados
│   │   ├── routes/         # Definição das rotas
│   │   ├── validators/     # Schemas de validação Joi
│   │   └── server.js       # Ponto de entrada
│   ├── uploads/            # Arquivos enviados
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/            # Páginas (App Router)
│   │   │   ├── admin/      # Painel administrativo
│   │   │   └── equipamentos/ # Catálogo público
│   │   ├── components/     # Componentes React
│   │   │   ├── layout/     # Header, Footer
│   │   │   ├── site/       # Componentes do site
│   │   │   └── admin/      # Componentes do admin
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilitários e API client
│   │   ├── styles/         # Estilos globais
│   │   └── types/          # Definições TypeScript
│   ├── public/             # Arquivos estáticos
│   ├── package.json
│   └── next.config.js
│
└── README.md
```

## ⚙️ Configuração do Ambiente

### Pré-requisitos
- Node.js 18+
- MySQL 8.0+
- npm ou yarn

### 1. Banco de Dados

```sql
CREATE DATABASE ipiranga_fitness;
```

### 2. Backend

```bash
cd backend

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar .env com suas configurações
# DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, etc.

# Executar migrations
npm run migrate

# Popular banco com dados iniciais
npm run seed

# Iniciar servidor de desenvolvimento
npm run dev
```

### 3. Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Criar arquivo .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local

# Iniciar servidor de desenvolvimento
npm run dev
```

## 🔐 Acesso ao Sistema

### Painel Administrativo
- **URL:** `http://localhost:3000/admin`
- **Email:** `admin@equipamentosipiranga.com.br`
- **Senha:** `admin123`

### Site Público
- **URL:** `http://localhost:3000`

## 📋 Funcionalidades

### Site Público
- ✅ Home com carrossel de banners
- ✅ Catálogo de equipamentos com filtros
- ✅ Páginas de categorias
- ✅ Páginas de produtos com galeria
- ✅ Sistema de carrinho/cotação
- ✅ Formulário de solicitação de cotação
- ✅ Design responsivo
- ✅ Animações suaves

### Painel Administrativo
- ✅ Dashboard com estatísticas
- ✅ Gestão de produtos (CRUD)
- ✅ Gestão de categorias
- ✅ Gestão de banners
- ✅ Visualização de cotações
- ✅ Upload de imagens
- ✅ Upload de logo
- ✅ Configurações de SEO
- ✅ Controle de permissões

## 🗃️ Banco de Dados

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários administrativos |
| `categories` | Categorias de produtos |
| `products` | Equipamentos |
| `product_images` | Galeria de imagens |
| `banners` | Banners do carrossel |
| `quotation_requests` | Solicitações de cotação |
| `quotation_items` | Itens das cotações |
| `site_settings` | Configurações do site |
| `activity_logs` | Logs de atividade |

## 🔌 API Endpoints

### Autenticação
```
POST   /api/auth/login        # Login
GET    /api/auth/me           # Usuário atual
PUT    /api/auth/profile      # Atualizar perfil
PUT    /api/auth/password     # Alterar senha
```

### Categorias
```
GET    /api/categories        # Listar
GET    /api/categories/:slug  # Obter por slug
POST   /api/categories        # Criar
PUT    /api/categories/:id    # Atualizar
DELETE /api/categories/:id    # Deletar
```

### Produtos
```
GET    /api/products          # Listar
GET    /api/products/featured # Destaques
GET    /api/products/:slug    # Obter por slug
POST   /api/products          # Criar
PUT    /api/products/:id      # Atualizar
DELETE /api/products/:id      # Deletar
POST   /api/products/:id/images # Upload de imagem
```

### Banners
```
GET    /api/banners           # Listar
GET    /api/banners/active    # Ativos
POST   /api/banners           # Criar
PUT    /api/banners/:id       # Atualizar
DELETE /api/banners/:id       # Deletar
```

### Cotações
```
GET    /api/quotations        # Listar
GET    /api/quotations/stats  # Estatísticas
GET    /api/quotations/:id    # Obter
POST   /api/quotations        # Criar (público)
PUT    /api/quotations/:id/status  # Atualizar status
GET    /api/quotations/export      # Exportar CSV
```

### Configurações
```
GET    /api/settings/public   # Configurações públicas
GET    /api/settings          # Todas (admin)
PUT    /api/settings          # Atualizar
POST   /api/settings/logo     # Upload logo
```

## 🎨 Design System

### Cores
- **Primária:** Amber (#F59E0B)
- **Background:** Neutral 950 (#0A0A0A)
- **Cards:** Neutral 900 (#171717)
- **Bordas:** Neutral 800 (#262626)

### Tipografia
- **Títulos:** Font-weight 700 (Bold)
- **Corpo:** Font-weight 400 (Regular)

## 🚀 Deploy

### Backend (Exemplo com PM2)
```bash
cd backend
npm run build
pm2 start ecosystem.config.js
```

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy via Vercel CLI ou Git
```

## 📝 Scripts Disponíveis

### Backend
```bash
npm run dev       # Desenvolvimento
npm run start     # Produção
npm run migrate   # Executar migrations
npm run seed      # Popular dados
```

### Frontend
```bash
npm run dev       # Desenvolvimento
npm run build     # Build produção
npm run start     # Iniciar produção
npm run lint      # Verificar código
```

## 🔒 Segurança

- JWT com expiração configurável
- Hash de senhas com bcrypt (12 rounds)
- Validação de inputs com Joi
- Queries parametrizadas (SQL injection prevention)
- Rate limiting configurado
- CORS configurado
- Helmet para headers HTTP

## 📱 Responsividade

O sistema é totalmente responsivo:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é proprietário da Ipiranga Fitness / ATTROS Metalúrgica LTDA.

---

**Desenvolvido com ❤️ para Equipamentos Ipiranga**
