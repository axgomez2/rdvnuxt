# RDV 2026 - Nuxt.js Frontend

Frontend em Nuxt.js 3 para a loja de discos de vinil RDV 2026.

## Stack Tecnológica

- **Framework**: Nuxt.js 3 (Vue 3)
- **Linguagem**: TypeScript
- **Estilização**: TailwindCSS
- **State Management**: Pinia
- **Utilitários**: VueUse
- **API**: Laravel Backend (loja2026)

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

O servidor de desenvolvimento estará disponível em `http://localhost:3000`

## Build para Produção

```bash
npm run build
npm run preview
```

## Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```
NUXT_PUBLIC_API_BASE=http://localhost:8000/api
```

## Integração com API Laravel

Este frontend consome a API existente do projeto loja2026:
- Autenticação via Laravel Sanctum
- Endpoints de produtos, carrinho, pedidos, etc.
- Webhooks do Mercado Pago

## Estrutura do Projeto

```
├── assets/           # Assets estáticos (CSS, imagens)
├── components/       # Componentes Vue
├── composables/      # Composables (lógica reutilizável)
├── layouts/          # Layouts Nuxt
├── pages/            # Páginas e rotas
├── plugins/          # Plugins Nuxt
├── stores/           # Stores Pinia
├── types/            # Tipos TypeScript
└── utils/            # Utilitários
```
