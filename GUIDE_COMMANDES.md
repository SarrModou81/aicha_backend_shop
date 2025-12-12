# 📦 Guide Complet - Gestion des Commandes AICHA SHOP

## 🔄 Workflow Complet des Commandes

### Vue d'ensemble

```
CLIENT                    VENDEUR                   ADMIN
  |                          |                        |
  | 1. Passe commande        |                        |
  |------------------------->|                        |
  |    [PENDING]             |                        |
  |                          |                        |
  |                          | 2. Confirme            |
  |                          |----------------------->|
  |    [CONFIRMED]           |                        |
  |                          |                        |
  |                          | 3. En préparation      |
  |                          |----------------------->|
  |    [PROCESSING]          |                        |
  |                          |                        |
  |                          | 4. Expédie + tracking  |
  |                          |----------------------->|
  |    [SHIPPED]             |                        |
  |                          |                        |
  |                          |                        | 5. Marque livrée
  |                          |                        |---------------->
  |    [DELIVERED]           |                        |
  |                          |                        |
```

---

## 👤 POUR LE CLIENT

### 1. Passer une Commande

**Route**: `/checkout`

**Étapes**:
1. Aller au panier
2. Cliquer sur "Procéder au paiement"
3. Sélectionner/ajouter une adresse de livraison
4. Choisir un mode de paiement:
   - 💵 Paiement à la livraison
   - 💳 Carte bancaire
   - 📱 Wave
   - 📱 Orange Money
   - 📱 Free Money
5. Ajouter des notes (optionnel)
6. Cliquer sur "Passer la commande"

**Statut après**: 📝 **PENDING** (En attente)

---

### 2. Suivre ses Commandes

**Route**: `/orders`

**Ce que vous pouvez voir**:
- ✅ Liste de toutes vos commandes
- 🎨 Badges colorés par statut
- 📦 Articles commandés avec images
- 💰 Montant total
- 📍 Adresse de livraison
- 💳 Méthode de paiement

**Filtres disponibles**:
- Toutes
- En attente
- Confirmées
- En préparation
- Expédiées
- Livrées
- Annulées

---

### 3. Voir les Détails d'une Commande

**Route**: `/orders/{id}`

**Ce que vous voyez**:

📍 **Timeline de Progression** (Animée):
```
📝 Commande passée    ✓
↓
✅ Confirmée          ✓
↓
📦 En préparation     ✓
↓
🚚 Expédiée          ← (En cours)
↓
🎉 Livrée
```

**Informations détaillées**:
- Liste complète des articles avec images
- Prix et quantités
- Adresse de livraison complète
- Statut du paiement
- Numéro de suivi (si expédiée)
- Date de commande
- Notes de livraison

---

### 4. Annuler une Commande

**Conditions**:
- ⚠️ Seulement si statut = "En attente" ou "Confirmée"
- ❌ Impossible si déjà en préparation ou expédiée

**Comment**:
1. Aller sur `/orders/{id}`
2. Cliquer sur "Annuler la commande"
3. Indiquer la raison
4. Confirmer

---

## 🏪 POUR LE VENDEUR

### 1. Accéder à la Gestion des Commandes

**Route**: `/seller/orders`

**Interface**: Cartes modernes avec actions contextuelles

---

### 2. Workflow de Gestion

#### Étape 1: Commande Reçue (PENDING)

**Ce que vous voyez**:
- 🔔 Nouvelle commande
- Badge jaune "En attente"
- Informations client
- Montant total

**Action disponible**:
```
✅ Confirmer
```

**Que fait ce bouton**:
- Change le statut à "CONFIRMED"
- Notifie le client (si notifications activées)
- API: `POST /api/v1/seller/orders/{id}/confirm`

---

#### Étape 2: Commande Confirmée (CONFIRMED)

**Badge**: Bleu "Confirmée"

**Action disponible**:
```
📦 En préparation
```

**Que fait ce bouton**:
- Change le statut à "PROCESSING"
- Indique que vous préparez les articles
- API: `POST /api/v1/seller/orders/{id}/processing`

---

#### Étape 3: En Préparation (PROCESSING)

**Badge**: Violet "En préparation"

**Action disponible**:
```
🚚 Expédier
```

**Que fait ce bouton**:
1. Demande le numéro de suivi (optionnel)
2. Change le statut à "SHIPPED"
3. Enregistre le numéro de tracking
4. API: `POST /api/v1/seller/orders/{id}/shipped`

---

#### Étape 4: Expédiée (SHIPPED)

**Badge**: Gris "Expédiée"

**Actions vendeur**: ✅ Complétées

**Prochaine étape**: L'admin marque comme "Livrée"

---

### 3. Filtrer les Commandes

**Filtres disponibles** (avec compteur):
- Toutes (120)
- En attente (15)
- Confirmées (25)
- En préparation (18)
- Expédiées (45)
- Livrées (15)
- Annulées (2)

---

### 4. Voir les Détails

**Bouton**: 👁️ Voir détails

**Route**: `/seller/orders/{id}`

**Informations complètes**:
- Client et contact
- Liste des articles
- Adresse de livraison
- Méthode de paiement
- Historique des changements

---

## 👨‍💼 POUR L'ADMINISTRATEUR

### 1. Accéder aux Commandes

**Route**: `/admin/orders`

---

### 2. Marquer comme Livrée

**Conditions**:
- ✅ Commande doit être au statut "SHIPPED"

**Comment**:
1. Filtrer par "Expédiées"
2. Trouver la commande
3. Cliquer sur "Marquer livrée"
4. Confirmer

**Que fait cette action**:
- Change le statut à "DELIVERED"
- Finalise la commande
- Met à jour le paiement si nécessaire
- API: `POST /api/v1/admin/orders/{id}/mark-delivered`

---

## 🎨 Badges de Statut (Couleurs)

| Statut | Badge | Couleur | Qui peut changer |
|--------|-------|---------|------------------|
| PENDING | 📝 En attente | 🟡 Jaune | Vendeur → Confirmer |
| CONFIRMED | ✅ Confirmée | 🔵 Bleu | Vendeur → En préparation |
| PROCESSING | 📦 En préparation | 🟣 Violet | Vendeur → Expédier |
| SHIPPED | 🚚 Expédiée | ⚪ Gris | Admin → Marquer livrée |
| DELIVERED | 🎉 Livrée | 🟢 Vert | Final |
| CANCELLED | ❌ Annulée | 🔴 Rouge | Final |

---

## 📋 API Endpoints Disponibles

### Client
```
GET  /api/v1/client/orders           - Liste des commandes
POST /api/v1/client/orders           - Créer une commande
GET  /api/v1/client/orders/{id}      - Détails d'une commande
POST /api/v1/client/orders/{id}/cancel - Annuler une commande
```

### Vendeur
```
GET  /api/v1/seller/orders                    - Liste des commandes
GET  /api/v1/seller/orders/{id}               - Détails
POST /api/v1/seller/orders/{id}/confirm       - Confirmer
POST /api/v1/seller/orders/{id}/processing    - En préparation
POST /api/v1/seller/orders/{id}/shipped       - Expédier
```

### Admin
```
GET  /api/v1/admin/orders                    - Toutes les commandes
GET  /api/v1/admin/orders/{id}               - Détails
POST /api/v1/admin/orders/{id}/mark-delivered - Marquer livrée
GET  /api/v1/admin/orders/stats              - Statistiques
```

---

## ✅ Checklist de Test

### Test Client
- [ ] Créer une commande depuis le checkout
- [ ] Voir la liste des commandes
- [ ] Ouvrir les détails d'une commande
- [ ] Voir la timeline de progression
- [ ] Annuler une commande en attente

### Test Vendeur
- [ ] Se connecter en tant que vendeur
- [ ] Voir les nouvelles commandes (PENDING)
- [ ] Confirmer une commande → CONFIRMED
- [ ] Marquer en préparation → PROCESSING
- [ ] Expédier avec numéro de suivi → SHIPPED
- [ ] Vérifier que les badges changent de couleur

### Test Admin
- [ ] Se connecter en tant qu'admin
- [ ] Voir toutes les commandes
- [ ] Filtrer par statut "Expédiée"
- [ ] Marquer une commande comme livrée → DELIVERED
- [ ] Vérifier les statistiques

---

## 🐛 Dépannage

### Le statut ne change pas
1. Vérifier la connexion Internet
2. Ouvrir la console du navigateur (F12)
3. Vérifier les erreurs API
4. Recharger la page

### Les commandes ne s'affichent pas
1. Vérifier que le backend est démarré: `php artisan serve`
2. Vérifier l'authentification (token valide)
3. Vérifier les logs Laravel: `tail -f storage/logs/laravel.log`

### Erreur lors du changement de statut
1. Vérifier les permissions utilisateur
2. Vérifier que le statut actuel permet la transition
3. Exemples de transitions invalides:
   - ❌ PENDING → SHIPPED (manque CONFIRMED et PROCESSING)
   - ❌ DELIVERED → PROCESSING (commande déjà livrée)
   - ❌ CANCELLED → CONFIRMED (commande annulée)

---

## 📱 URLs Importantes

### Frontend
- Client: `http://localhost:4200/`
- Vendeur: `http://localhost:4200/seller`
- Admin: `http://localhost:4200/admin`

### Backend
- API: `http://localhost:8000/api/v1/`
- Documentation: Les routes ci-dessus

---

## 🎯 Résumé Rapide

**Client**: Passe commande → Suit la progression → Peut annuler si tôt

**Vendeur**: Confirme → Prépare → Expédie (avec tracking)

**Admin**: Marque comme livrée quand le client reçoit

**Statuts**: PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED

---

✨ **Le système est maintenant complètement opérationnel !**
