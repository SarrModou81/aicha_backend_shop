# AICHA SHOP - Backend API

Backend API REST pour la plateforme e-commerce AICHA SHOP développé avec Laravel 10.

## 🎯 Description

AICHA SHOP est une plateforme e-commerce complète permettant la vente de vêtements, chaussures, sacs et accessoires. Le système gère trois types d'utilisateurs : Clients, Vendeurs et Administrateurs.

## ✨ Fonctionnalités principales

### 👤 Clients
- Navigation et recherche de produits avec filtres avancés
- Gestion du panier d'achat
- Passage de commandes
- Gestion des adresses de livraison
- Suivi des commandes
- Gestion du profil

### 🏪 Vendeurs
- Gestion complète du catalogue de produits
- Gestion des commandes reçues
- Suivi des stocks avec alertes automatiques
- Tableau de bord avec statistiques de ventes
- Gestion du profil boutique

### 👨‍💼 Administrateurs
- Gestion des utilisateurs (clients et vendeurs)
- Validation des vendeurs
- Modération des produits
- Supervision globale des commandes
- Gestion des catégories
- Configuration du système
- Tableau de bord avec statistiques globales

## 🛠️ Technologies utilisées

- **Framework**: Laravel 10
- **Authentification**: Laravel Sanctum
- **Base de données**: MySQL
- **PHP**: 8.1+

## 📋 Prérequis

- PHP >= 8.1
- Composer
- MySQL >= 5.7 ou MariaDB
- Extension PHP : PDO, Mbstring, OpenSSL, Tokenizer, XML, Ctype, JSON

## 🚀 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/SarrModou81/aicha_backend_shop.git
cd aicha_backend_shop
```

### 2. Installer les dépendances

```bash
composer install
```

### 3. Configuration de l'environnement

Le fichier `.env` est déjà créé. Modifiez les paramètres de base de données :

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=aicha_shop
DB_USERNAME=votre_username
DB_PASSWORD=votre_password
```

### 4. Générer la clé d'application

```bash
php artisan key:generate
```

### 5. Créer la base de données

Créez une base de données MySQL nommée `aicha_shop` :

```sql
CREATE DATABASE aicha_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 6. Exécuter les migrations

```bash
php artisan migrate
```

### 7. Peupler la base de données (optionnel)

Pour ajouter des données de test :

```bash
php artisan db:seed
```

### 8. Démarrer le serveur

```bash
php artisan serve
```

L'API sera accessible à : `http://localhost:8000`

## 🔑 Comptes de test

Après avoir exécuté les seeders :

- **Admin**: admin@aichashop.sn / password123
- **Vendeur**: fatou@aichashop.sn / password123
- **Client**: client1@example.com / password123

## 📚 Documentation API

### URL de base

```
http://localhost:8000/api/v1
```

Consultez le fichier pour la documentation complète des endpoints.

## 📄 Licence

Ce projet est sous licence MIT.
