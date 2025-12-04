# AICHA SHOP - Frontend Angular

Frontend de la plateforme e-commerce AICHA SHOP développé avec Angular 17.

## 🚀 Technologies

- **Framework**: Angular 17
- **Styling**: SCSS
- **Architecture**: NgModules (--standalone false)
- **HTTP Client**: Angular HttpClient
- **Routing**: Angular Router

## 📋 Prérequis

- Node.js >= 18
- npm >= 9
- Angular CLI 17

## 🛠️ Installation

### 1. Installer Angular CLI

```bash
npm install -g @angular/cli@17
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration

Le fichier `src/environments/environment.ts` contient l'URL de l'API backend :

```typescript
apiUrl: 'http://localhost:8000/api/v1'
```

Assurez-vous que le backend Laravel est démarré sur le port 8000.

### 4. Ajouter le logo

Placez le logo AICHA SHOP dans `src/assets/images/logo.png`

### 5. Démarrer le serveur

```bash
npm start
```

L'application sera accessible à : `http://localhost:4200`

## 📁 Structure du projet

```
src/
├── app/
│   ├── core/               # Services, Guards, Interceptors
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── services/
│   ├── shared/             # Composants partagés
│   │   ├── components/
│   │   └── models/
│   ├── features/           # Modules fonctionnels
│   │   ├── auth/
│   │   ├── client/
│   │   ├── seller/
│   │   └── admin/
│   └── layout/             # Layout principal
├── assets/
│   └── images/
│       └── logo.png
├── environments/
└── styles.scss
```

## 🔑 Comptes de test

Utilisez les mêmes comptes que le backend :

- **Admin**: admin@aichashop.sn / password123
- **Vendeur**: fatou@aichashop.sn / password123
- **Client**: client1@example.com / password123

## 🎨 Thème

Les couleurs principales :
- Primary: #e91e63 (Rose)
- Secondary: #ff4081
- Accent: #f50057

## 📄 Licence

MIT
