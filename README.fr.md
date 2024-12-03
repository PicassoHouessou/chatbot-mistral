# Chatbot Mistral

Application de chat propulsée par un grand modèle de langage (LLM), permettant des interactions IA contextuelles directement dans le navigateur.

[Read in English](README.md)

![Screenshot](docs/screenshot.png)

## Fonctionnalités

- Authentification
- Chat avec Mistral AI
- Historique des conversations persisté dans MongoDB (par utilisateur)
- Gestion multi-conversations (créer, renommer, supprimer)
- Rendu Markdown dans les réponses de l'IA
- Interface sombre responsive

## Prérequis

- Node.js 18+
- pnpm
- Docker (pour MongoDB)

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/PicassoHouessou/chatbot-mistral
cd chatbot-mistral
```

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Configurer les variables d'environnement

Copier le fichier exemple :

```bash
cp .env.local.example .env.local
```

Remplir les valeurs :

```env
# Obtenir votre clé API sur https://console.mistral.ai/
MISTRAL_API_KEY=votre_cle_api_mistral

# Générer avec : openssl rand -base64 32
NEXTAUTH_SECRET=votre_secret_nextauth
NEXTAUTH_URL=http://localhost:3000

# Connexion MongoDB (correspond aux valeurs par défaut du docker-compose)
MONGODB_URI=mongodb://admin:password@localhost:27018/chatbot?authSource=admin
```

### 4. Démarrer MongoDB

```bash
docker compose up -d
```

### 5. Initialiser la base de données

```bash
npx tsx scripts/seed.ts
```

### 6. Lancer le serveur de développement

```bash
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Comptes de démonstration

| Pseudo   | Mot de passe |
|----------|--------------|
| picasso  | password     |
| delphine | password     |
| raoul    | password     |

## Technologies utilisées

- **Next.js 14** — App Router
- **TypeScript**
- **Tailwind CSS**
- **NextAuth v4** — Authentification
- **Mistral AI SDK** (`@mistralai/mistralai`)
- **MongoDB 7** + **Mongoose** — Persistance des données
- **Docker** — Base de données locale
- **react-markdown** + **remark-gfm** — Rendu Markdown
- **bcryptjs** — Hachage des mots de passe
- **Lucide React** — Icônes

*Projet réalisé dans le cadre du cours Méthode agile — EILCO.*
