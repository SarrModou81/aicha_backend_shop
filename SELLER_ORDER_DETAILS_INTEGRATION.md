# 🏪 Guide d'intégration - Bouton "Voir détails" Interface Vendeur

## Vue d'ensemble

Ce document explique comment configurer le bouton **"Voir détails"** dans le menu des commandes de l'interface vendeur pour qu'il fonctionne correctement avec l'API backend.

---

## 📍 Endpoint Backend

### GET `/api/v1/seller/orders/{orderId}`

Cet endpoint retourne les détails complets d'une commande pour le vendeur connecté.

### Headers requis
```http
Authorization: Bearer {seller_token}
Content-Type: application/json
```

---

## 🎯 Configuration du Bouton "Voir détails"

### 1. Dans la liste des commandes

Chaque carte/ligne de commande doit avoir un bouton "Voir détails" :

```html
<!-- Exemple HTML/Angular -->
<button
  class="btn btn-primary btn-sm"
  (click)="viewOrderDetails(order.id)"
  [routerLink]="['/seller/orders', order.id]">
  <i class="bi bi-eye"></i> Voir détails
</button>
```

### 2. Fonction TypeScript/JavaScript

```typescript
// seller-orders.component.ts

viewOrderDetails(orderId: number) {
  // Navigation vers la page de détails
  this.router.navigate(['/seller/orders', orderId]);
}
```

### 3. Route Frontend

Configurez une route pour la page de détails :

```typescript
// app-routing.module.ts

{
  path: 'seller/orders/:id',
  component: SellerOrderDetailsComponent,
  canActivate: [SellerGuard]
}
```

---

## 📡 Appel API dans le Composant de Détails

### Service Angular

```typescript
// order.service.ts

getOrderDetails(orderId: number): Observable<any> {
  return this.http.get(`${this.apiUrl}/seller/orders/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${this.authService.getToken()}`
    }
  });
}
```

### Composant

```typescript
// seller-order-details.component.ts

export class SellerOrderDetailsComponent implements OnInit {
  orderId: number;
  order: any;
  sellerSummary: any;
  availableActions: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit() {
    // Récupérer l'ID de la commande depuis l'URL
    this.orderId = +this.route.snapshot.paramMap.get('id')!;

    // Charger les détails
    this.loadOrderDetails();
  }

  loadOrderDetails() {
    this.loading = true;
    this.error = null;

    this.orderService.getOrderDetails(this.orderId).subscribe({
      next: (response) => {
        this.order = response.order;
        this.sellerSummary = response.seller_summary;
        this.availableActions = response.available_actions;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement:', error);
        this.error = error.error?.message || 'Erreur lors du chargement de la commande';
        this.loading = false;

        // Si le vendeur n'a pas d'articles dans cette commande (403)
        if (error.status === 403) {
          this.router.navigate(['/seller/orders']);
        }
      }
    });
  }

  // Exécuter une action (confirmer, préparer, expédier)
  executeAction(action: any) {
    if (action.requires_tracking) {
      // Demander le numéro de suivi
      this.showTrackingModal(action);
    } else {
      this.confirmAction(action);
    }
  }

  confirmAction(action: any) {
    if (confirm(`Êtes-vous sûr de vouloir ${action.label.toLowerCase()} ?`)) {
      this.orderService.updateOrderStatus(this.orderId, action.name).subscribe({
        next: () => {
          // Recharger les détails pour mettre à jour le statut
          this.loadOrderDetails();
        },
        error: (error) => {
          alert('Erreur: ' + (error.error?.message || 'Action impossible'));
        }
      });
    }
  }
}
```

---

## 📦 Structure de la Réponse API

### Exemple de réponse complète

```json
{
  "order": {
    "id": 42,
    "order_number": "ORD-20241212-042",
    "user_id": 10,
    "address_id": 5,
    "subtotal": "65000.00",
    "shipping_cost": "2000.00",
    "total": "67000.00",
    "status": "pending",
    "status_label": "En attente",
    "status_color": "warning",
    "can_be_cancelled": true,
    "is_paid": false,
    "tracking_number": null,
    "notes": "Appeler avant de livrer",
    "created_at": "2024-12-12T10:30:00.000000Z",
    "updated_at": "2024-12-12T10:30:00.000000Z",

    "user": {
      "id": 10,
      "name": "Amadou Ba",
      "email": "amadou@example.com",
      "phone": "+221771234567"
    },

    "address": {
      "id": 5,
      "label": "Domicile",
      "full_name": "Amadou Ba",
      "phone": "+221771234567",
      "address_line": "Cité Keur Gorgui, Villa 123",
      "city": "Dakar",
      "postal_code": "12000",
      "country": "Sénégal"
    },

    "payment": {
      "id": 15,
      "payment_method": "cash_on_delivery",
      "amount": "67000.00",
      "status": "pending",
      "transaction_id": null
    },

    "items": [
      {
        "id": 85,
        "order_id": 42,
        "product_id": 1,
        "seller_id": 5,
        "product_name": "Nike Air Max 2024",
        "quantity": 2,
        "size": "40",
        "color": "black",
        "price": "20000.00",
        "subtotal": "40000.00",
        "product": {
          "id": 1,
          "name": "Nike Air Max 2024",
          "images": ["images/products/nike-air-max-1.jpg"],
          "brand": "Nike"
        }
      },
      {
        "id": 86,
        "order_id": 42,
        "product_id": 8,
        "seller_id": 5,
        "product_name": "T-shirt Sport",
        "quantity": 5,
        "size": "L",
        "color": "white",
        "price": "5000.00",
        "subtotal": "25000.00",
        "product": {
          "id": 8,
          "name": "T-shirt Sport",
          "images": ["images/products/tshirt-1.jpg"],
          "brand": "Adidas"
        }
      }
    ]
  },

  "seller_summary": {
    "items_count": 2,
    "subtotal": "65000.00"
  },

  "available_actions": [
    {
      "name": "confirm",
      "label": "Confirmer la commande",
      "method": "POST",
      "endpoint": "/api/v1/seller/orders/42/confirm",
      "color": "success"
    }
  ]
}
```

---

## 🎨 Template HTML pour la Page de Détails

### Structure recommandée

```html
<!-- seller-order-details.component.html -->

<div class="container mt-4" *ngIf="!loading">

  <!-- Header avec statut -->
  <div class="card mb-4">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h3 class="mb-1">Commande {{ order.order_number }}</h3>
          <small class="text-muted">{{ order.created_at | date:'medium' }}</small>
        </div>
        <span class="badge badge-{{ order.status_color }} badge-lg">
          {{ order.status_label }}
        </span>
      </div>
    </div>
  </div>

  <!-- Résumé vendeur -->
  <div class="card mb-4 border-primary">
    <div class="card-body">
      <h5 class="card-title">📊 Votre part de cette commande</h5>
      <div class="row">
        <div class="col-md-6">
          <p class="mb-1"><strong>Nombre d'articles:</strong></p>
          <h4>{{ sellerSummary.items_count }}</h4>
        </div>
        <div class="col-md-6">
          <p class="mb-1"><strong>Sous-total:</strong></p>
          <h4>{{ sellerSummary.subtotal | number:'1.0-0' }} FCFA</h4>
        </div>
      </div>
    </div>
  </div>

  <!-- Actions disponibles -->
  <div class="card mb-4" *ngIf="availableActions.length > 0">
    <div class="card-body">
      <h5 class="card-title">⚡ Actions disponibles</h5>
      <button
        *ngFor="let action of availableActions"
        class="btn btn-{{ action.color }} me-2"
        (click)="executeAction(action)">
        {{ action.label }}
      </button>
    </div>
  </div>

  <!-- Informations client -->
  <div class="card mb-4">
    <div class="card-body">
      <h5 class="card-title">👤 Client</h5>
      <p class="mb-1"><strong>Nom:</strong> {{ order.user.name }}</p>
      <p class="mb-1"><strong>Email:</strong> {{ order.user.email }}</p>
      <p class="mb-1"><strong>Téléphone:</strong> {{ order.user.phone }}</p>
    </div>
  </div>

  <!-- Adresse de livraison -->
  <div class="card mb-4">
    <div class="card-body">
      <h5 class="card-title">📍 Adresse de livraison</h5>
      <p class="mb-1"><strong>{{ order.address.label }}</strong></p>
      <p class="mb-1">{{ order.address.full_name }}</p>
      <p class="mb-1">{{ order.address.phone }}</p>
      <p class="mb-1">{{ order.address.address_line }}</p>
      <p class="mb-0">{{ order.address.city }}, {{ order.address.postal_code }}</p>
      <p class="mb-0">{{ order.address.country }}</p>
    </div>
  </div>

  <!-- Articles de la commande -->
  <div class="card mb-4">
    <div class="card-body">
      <h5 class="card-title">📦 Vos articles dans cette commande</h5>

      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Taille</th>
              <th>Couleur</th>
              <th>Prix unitaire</th>
              <th>Quantité</th>
              <th>Sous-total</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of order.items">
              <td>
                <div class="d-flex align-items-center">
                  <img
                    [src]="item.product.images[0]"
                    alt="{{ item.product_name }}"
                    class="img-thumbnail me-2"
                    style="width: 50px; height: 50px; object-fit: cover;">
                  <div>
                    <strong>{{ item.product_name }}</strong><br>
                    <small class="text-muted">{{ item.product.brand }}</small>
                  </div>
                </div>
              </td>
              <td>{{ item.size }}</td>
              <td>{{ item.color }}</td>
              <td>{{ item.price | number:'1.0-0' }} FCFA</td>
              <td>{{ item.quantity }}</td>
              <td><strong>{{ item.subtotal | number:'1.0-0' }} FCFA</strong></td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="5" class="text-end"><strong>Total de vos articles:</strong></td>
              <td><strong>{{ sellerSummary.subtotal | number:'1.0-0' }} FCFA</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>

  <!-- Informations paiement -->
  <div class="card mb-4">
    <div class="card-body">
      <h5 class="card-title">💳 Paiement</h5>
      <p class="mb-1"><strong>Méthode:</strong> {{ order.payment.payment_method }}</p>
      <p class="mb-1"><strong>Montant total commande:</strong> {{ order.total | number:'1.0-0' }} FCFA</p>
      <p class="mb-0">
        <span class="badge" [class.badge-success]="order.is_paid" [class.badge-warning]="!order.is_paid">
          {{ order.is_paid ? 'Payé' : 'En attente' }}
        </span>
      </p>
    </div>
  </div>

  <!-- Notes -->
  <div class="card mb-4" *ngIf="order.notes">
    <div class="card-body">
      <h5 class="card-title">📝 Notes de livraison</h5>
      <p class="mb-0">{{ order.notes }}</p>
    </div>
  </div>

  <!-- Numéro de suivi -->
  <div class="card mb-4" *ngIf="order.tracking_number">
    <div class="card-body">
      <h5 class="card-title">🚚 Suivi</h5>
      <p class="mb-0"><strong>Numéro de suivi:</strong> {{ order.tracking_number }}</p>
    </div>
  </div>

  <!-- Bouton retour -->
  <div class="text-center mb-4">
    <button class="btn btn-secondary" routerLink="/seller/orders">
      ← Retour à la liste des commandes
    </button>
  </div>

</div>

<!-- Loader -->
<div class="text-center py-5" *ngIf="loading">
  <div class="spinner-border" role="status">
    <span class="visually-hidden">Chargement...</span>
  </div>
</div>

<!-- Erreur -->
<div class="alert alert-danger m-4" *ngIf="error">
  {{ error }}
</div>
```

---

## 🎯 CSS Recommandé

```css
/* seller-order-details.component.css */

.badge-lg {
  font-size: 1rem;
  padding: 0.5rem 1rem;
}

.badge-purple {
  background-color: #6f42c1;
  color: white;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border-radius: 0.5rem;
}

.card-title {
  color: #333;
  font-weight: 600;
  margin-bottom: 1rem;
}

.img-thumbnail {
  border-radius: 0.375rem;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
}
```

---

## ✅ Checklist d'Intégration

### Backend (Déjà configuré ✓)
- [x] Endpoint `/seller/orders/{orderId}` créé
- [x] Authentification requise (Sanctum + middleware vendeur)
- [x] Filtrage des articles par seller_id
- [x] Relations chargées (user, address, items, payment)
- [x] Attributs calculés ajoutés (status_label, status_color, etc.)
- [x] Actions disponibles retournées dynamiquement
- [x] Résumé vendeur inclus

### Frontend (À implémenter)
- [ ] Bouton "Voir détails" ajouté dans la liste des commandes
- [ ] Route `/seller/orders/:id` configurée
- [ ] Composant `SellerOrderDetailsComponent` créé
- [ ] Service pour l'appel API implémenté
- [ ] Template HTML pour l'affichage des détails
- [ ] Gestion du loading et des erreurs
- [ ] Boutons d'action dynamiques basés sur `available_actions`
- [ ] Modal pour saisir le numéro de suivi (action shipped)

---

## 🚀 Test de l'Intégration

### 1. Test du bouton depuis la liste

```bash
# Depuis l'interface vendeur, dans la liste des commandes:
1. Cliquez sur "Voir détails" d'une commande
2. Vérifiez que vous êtes redirigé vers /seller/orders/{id}
3. Vérifiez que les détails s'affichent correctement
```

### 2. Test avec cURL

```bash
# Obtenir un token vendeur
TOKEN="votre_token_vendeur_ici"

# Appeler l'endpoint
curl -X GET "http://localhost:8000/api/v1/seller/orders/42" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"
```

### 3. Cas de test

| Cas | Attendu |
|-----|---------|
| Commande avec articles du vendeur | Affichage des détails ✓ |
| Commande sans articles du vendeur | Erreur 403 + redirection |
| Commande inexistante | Erreur 404 |
| Token invalide | Erreur 401 |
| Non-vendeur | Erreur 403 |

---

## 🐛 Dépannage

### Le bouton ne fonctionne pas
1. Vérifiez que le routerLink est correct: `['/seller/orders', order.id]`
2. Vérifiez que la route est déclarée dans le routing module
3. Vérifiez que le guard `SellerGuard` est configuré

### Erreur 403 "Vous n'avez pas d'articles dans cette commande"
- C'est normal si le vendeur essaie d'accéder à une commande où il n'a aucun article
- L'application doit rediriger vers la liste des commandes

### Les détails ne s'affichent pas
1. Ouvrez la console du navigateur (F12)
2. Vérifiez l'onglet Network pour voir la réponse de l'API
3. Vérifiez que le token est bien envoyé dans les headers
4. Vérifiez que l'API backend est démarrée (`php artisan serve`)

---

## 📞 Support

Pour toute question sur l'intégration:
- Consultez [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- Consultez [GUIDE_COMMANDES.md](./GUIDE_COMMANDES.md)

---

✨ **L'endpoint backend est maintenant optimisé pour faciliter l'intégration frontend du bouton "Voir détails" !**
