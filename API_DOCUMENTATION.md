# 📖 AICHA SHOP - API Documentation

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
Most endpoints require authentication using Laravel Sanctum. Include the token in the Authorization header:
```
Authorization: Bearer {your-token}
```

---

## 🛍️ Product Navigation Endpoints (Public)

These endpoints are publicly accessible and don't require authentication.

### 1. Browse All Products

**GET** `/products`

Browse the product catalog with advanced filtering, search, and sorting capabilities.

#### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Search in name, description, brand | `?search=nike` |
| `category_id` | integer | Filter by category | `?category_id=5` |
| `brand` | string | Filter by brand | `?brand=Adidas` |
| `min_price` | decimal | Minimum price | `?min_price=1000` |
| `max_price` | decimal | Maximum price | `?max_price=50000` |
| `size` | string | Filter by size | `?size=L` |
| `color` | string | Filter by color | `?color=red` |
| `on_sale` | boolean | Only show products on sale | `?on_sale=1` |
| `sort_by` | string | Sort field: `created_at`, `price_asc`, `price_desc`, `name`, `rating` | `?sort_by=price_asc` |
| `sort_order` | string | Sort direction: `asc`, `desc` | `?sort_order=desc` |
| `per_page` | integer | Items per page (default: 15) | `?per_page=20` |
| `page` | integer | Page number | `?page=2` |

#### Example Request
```bash
GET /api/v1/products?search=chaussure&min_price=5000&max_price=30000&sort_by=price_asc&per_page=20
```

#### Success Response (200 OK)
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "name": "Nike Air Max 2024",
      "slug": "nike-air-max-2024",
      "description": "Chaussures de sport ultra confortables",
      "price": "25000.00",
      "discount_price": "20000.00",
      "final_price": "20000.00",
      "is_on_sale": true,
      "discount_percentage": 20,
      "brand": "Nike",
      "sizes": ["38", "39", "40", "41", "42"],
      "colors": ["black", "white", "red"],
      "images": ["images/products/nike-air-max-1.jpg"],
      "stock": 50,
      "is_visible": true,
      "is_approved": true,
      "average_rating": 4.5,
      "reviews_count": 12,
      "category": {
        "id": 2,
        "name": "Chaussures",
        "slug": "chaussures"
      },
      "seller": {
        "id": 5,
        "name": "Fatou Diop",
        "shop_name": "Fatou Style",
        "shop_description": "Mode et élégance"
      },
      "created_at": "2024-12-01T10:30:00.000000Z",
      "updated_at": "2024-12-11T15:20:00.000000Z"
    }
  ],
  "first_page_url": "http://localhost:8000/api/v1/products?page=1",
  "from": 1,
  "last_page": 5,
  "last_page_url": "http://localhost:8000/api/v1/products?page=5",
  "next_page_url": "http://localhost:8000/api/v1/products?page=2",
  "path": "http://localhost:8000/api/v1/products",
  "per_page": 15,
  "prev_page_url": null,
  "to": 15,
  "total": 73
}
```

---

### 2. Products On Sale

**GET** `/products/on-sale`

Get all products currently on sale, sorted by discount percentage (highest first).

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `per_page` | integer | Items per page (default: 15) |
| `page` | integer | Page number |

#### Example Request
```bash
GET /api/v1/products/on-sale?per_page=12
```

#### Success Response (200 OK)
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 15,
      "name": "Robe d'été florale",
      "price": "15000.00",
      "discount_price": "7500.00",
      "final_price": "7500.00",
      "is_on_sale": true,
      "discount_percentage": 50,
      "category": {
        "id": 1,
        "name": "Vêtements"
      },
      "seller": {
        "id": 5,
        "name": "Fatou Diop"
      }
    }
  ],
  "total": 24
}
```

---

### 3. New Arrivals

**GET** `/products/new-arrivals`

Get the latest products added to the catalog.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `per_page` | integer | Items per page (default: 15) |
| `page` | integer | Page number |

#### Example Request
```bash
GET /api/v1/products/new-arrivals?per_page=8
```

#### Success Response (200 OK)
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 42,
      "name": "Sac à main cuir premium",
      "price": "35000.00",
      "discount_price": null,
      "final_price": "35000.00",
      "is_on_sale": false,
      "created_at": "2024-12-11T18:30:00.000000Z"
    }
  ],
  "total": 15
}
```

---

### 4. Popular Products

**GET** `/products/popular`

Get the most popular products based on sales count.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `per_page` | integer | Items per page (default: 15) |
| `page` | integer | Page number |

#### Example Request
```bash
GET /api/v1/products/popular?per_page=10
```

#### Success Response (200 OK)
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 8,
      "name": "T-shirt basique blanc",
      "price": "5000.00",
      "order_items_count": 145,
      "category": {
        "id": 1,
        "name": "Vêtements"
      }
    }
  ],
  "total": 73
}
```

---

### 5. Product Details

**GET** `/products/{id}`

Get detailed information about a specific product, including reviews.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Product ID |

#### Example Request
```bash
GET /api/v1/products/1
```

#### Success Response (200 OK)
```json
{
  "product": {
    "id": 1,
    "name": "Nike Air Max 2024",
    "slug": "nike-air-max-2024",
    "description": "Chaussures de sport ultra confortables avec amorti Air Max. Parfait pour le running et les activités sportives quotidiennes.",
    "price": "25000.00",
    "discount_price": "20000.00",
    "final_price": "20000.00",
    "is_on_sale": true,
    "discount_percentage": 20,
    "brand": "Nike",
    "sizes": ["38", "39", "40", "41", "42", "43"],
    "colors": ["black", "white", "red", "blue"],
    "images": [
      "images/products/nike-air-max-1.jpg",
      "images/products/nike-air-max-2.jpg",
      "images/products/nike-air-max-3.jpg"
    ],
    "stock": 50,
    "stock_alert_threshold": 10,
    "is_visible": true,
    "is_approved": true,
    "category": {
      "id": 2,
      "name": "Chaussures",
      "slug": "chaussures",
      "description": "Chaussures pour toutes occasions"
    },
    "seller": {
      "id": 5,
      "name": "Fatou Diop",
      "shop_name": "Fatou Style",
      "shop_description": "Mode et élégance sénégalaise"
    },
    "reviews": [
      {
        "id": 1,
        "rating": 5,
        "comment": "Excellente qualité, très confortables!",
        "is_approved": true,
        "user": {
          "id": 10,
          "name": "Moussa Sow"
        },
        "created_at": "2024-12-10T14:20:00.000000Z"
      }
    ],
    "created_at": "2024-12-01T10:30:00.000000Z",
    "updated_at": "2024-12-11T15:20:00.000000Z"
  },
  "average_rating": 4.5,
  "reviews_count": 12
}
```

#### Error Response (404 Not Found)
```json
{
  "message": "Product not found"
}
```

---

### 6. Similar Products

**GET** `/products/{id}/similar`

Get products similar to the specified product (based on category and brand).

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Product ID |

#### Example Request
```bash
GET /api/v1/products/1/similar
```

#### Success Response (200 OK)
```json
{
  "products": [
    {
      "id": 3,
      "name": "Nike Revolution 6",
      "price": "22000.00",
      "discount_price": null,
      "final_price": "22000.00",
      "brand": "Nike",
      "category": {
        "id": 2,
        "name": "Chaussures"
      }
    },
    {
      "id": 7,
      "name": "Adidas Ultraboost",
      "price": "28000.00",
      "discount_price": "24000.00",
      "final_price": "24000.00",
      "brand": "Adidas",
      "category": {
        "id": 2,
        "name": "Chaussures"
      }
    }
  ]
}
```

**Note**: Returns up to 8 similar products.

---

## 📂 Category Endpoints (Public)

### Get Products by Category

**GET** `/categories/{id}/products`

Get all products in a specific category.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Category ID |

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `per_page` | integer | Items per page (default: 15) |
| `page` | integer | Page number |

#### Example Request
```bash
GET /api/v1/categories/2/products?per_page=20
```

#### Success Response (200 OK)
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "name": "Nike Air Max 2024",
      "category_id": 2
    }
  ],
  "total": 45
}
```

---

## 🔒 Authentication Endpoints

### Register

**POST** `/auth/register`

Register a new user account.

#### Request Body
```json
{
  "name": "Amadou Ba",
  "email": "amadou@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "phone": "+221771234567",
  "role": "client"
}
```

**Note**: `role` can be: `client`, `vendeur`, `admin`

#### Success Response (201 Created)
```json
{
  "user": {
    "id": 15,
    "name": "Amadou Ba",
    "email": "amadou@example.com",
    "role": "client"
  },
  "token": "1|abc123xyz..."
}
```

---

### Login

**POST** `/auth/login`

Authenticate and receive an access token.

#### Request Body
```json
{
  "email": "amadou@example.com",
  "password": "password123"
}
```

#### Success Response (200 OK)
```json
{
  "user": {
    "id": 15,
    "name": "Amadou Ba",
    "email": "amadou@example.com",
    "role": "client"
  },
  "token": "1|abc123xyz..."
}
```

#### Error Response (401 Unauthorized)
```json
{
  "message": "Invalid credentials"
}
```

---

## 🛒 Shopping Cart Endpoints (Client)

**Authentication Required**: `Bearer Token`

### Get Cart

**GET** `/client/cart`

Get the current user's shopping cart.

#### Success Response (200 OK)
```json
{
  "cart": {
    "id": 1,
    "user_id": 15,
    "total_amount": "65000.00",
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "quantity": 2,
        "price": "20000.00",
        "subtotal": "40000.00",
        "product": {
          "id": 1,
          "name": "Nike Air Max 2024",
          "images": ["images/products/nike-air-max-1.jpg"]
        }
      }
    ]
  }
}
```

---

### Add to Cart

**POST** `/client/cart/add`

Add a product to the cart.

#### Request Body
```json
{
  "product_id": 1,
  "quantity": 2,
  "size": "40",
  "color": "black"
}
```

#### Success Response (201 Created)
```json
{
  "message": "Product added to cart",
  "cart_item": {
    "id": 5,
    "product_id": 1,
    "quantity": 2,
    "subtotal": "40000.00"
  }
}
```

---

## 📦 Order Endpoints (Client)

**Authentication Required**: `Bearer Token`

### Create Order

**POST** `/client/orders`

Place a new order from cart items.

#### Request Body
```json
{
  "address_id": 1,
  "payment_method": "cash_on_delivery",
  "delivery_notes": "Appeler avant de livrer"
}
```

**Payment Methods**: `cash_on_delivery`, `card`, `wave`, `orange_money`, `free_money`

#### Success Response (201 Created)
```json
{
  "message": "Order placed successfully",
  "order": {
    "id": 42,
    "order_number": "ORD-20241212-042",
    "total": "65000.00",
    "status": "pending"
  }
}
```

---

### Get My Orders

**GET** `/client/orders`

Get all orders for the authenticated user.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled` |
| `per_page` | integer | Items per page |

#### Success Response (200 OK)
```json
{
  "data": [
    {
      "id": 42,
      "order_number": "ORD-20241212-042",
      "total": "65000.00",
      "status": "pending",
      "created_at": "2024-12-12T10:30:00.000000Z"
    }
  ]
}
```

---

## 🏪 Seller Endpoints

**Authentication Required**: `Bearer Token` + `vendeur` role

### Get Seller Products

**GET** `/seller/products`

Get all products for the authenticated seller.

### Create Product

**POST** `/seller/products`

Create a new product.

#### Request Body
```json
{
  "category_id": 2,
  "name": "Baskets Sport Pro",
  "description": "Chaussures de sport haute performance",
  "price": 30000,
  "discount_price": 25000,
  "brand": "Nike",
  "sizes": ["38", "39", "40", "41"],
  "colors": ["black", "white"],
  "images": ["images/products/basket-1.jpg"],
  "stock": 50,
  "stock_alert_threshold": 10
}
```

---

### Get Seller Orders

**GET** `/seller/orders`

Get all orders containing the seller's products.

### Confirm Order

**POST** `/seller/orders/{orderId}/confirm`

Confirm a pending order.

### Mark as Processing

**POST** `/seller/orders/{orderId}/processing`

Mark order as being prepared.

### Mark as Shipped

**POST** `/seller/orders/{orderId}/shipped`

Mark order as shipped.

#### Request Body
```json
{
  "tracking_number": "TRK123456789"
}
```

---

## 👨‍💼 Admin Endpoints

**Authentication Required**: `Bearer Token` + `admin` role

### Get All Users

**GET** `/admin/users`

### Approve Seller

**POST** `/admin/sellers/{id}/approve`

### Suspend Seller

**POST** `/admin/sellers/{id}/suspend`

### Get All Products

**GET** `/admin/products`

### Approve Product

**POST** `/admin/products/{id}/approve`

### Reject Product

**POST** `/admin/products/{id}/reject`

#### Request Body
```json
{
  "reason": "Images de mauvaise qualité"
}
```

### Mark Order as Delivered

**POST** `/admin/orders/{id}/mark-delivered`

---

## 📊 Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Server Error |

---

## 🔄 Order Status Flow

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
                                              ↓
                                          CANCELLED
```

- **PENDING**: Order placed, awaiting seller confirmation
- **CONFIRMED**: Seller confirmed the order
- **PROCESSING**: Seller is preparing the order
- **SHIPPED**: Order has been shipped
- **DELIVERED**: Order delivered to customer
- **CANCELLED**: Order cancelled by customer or seller

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- Prices are in FCFA (West African CFA franc)
- Pagination follows Laravel's default format
- File uploads should use `multipart/form-data`
- Maximum file size: 5MB per image

---

## 🚀 Quick Start Examples

### Browse products with search and filters
```bash
curl -X GET "http://localhost:8000/api/v1/products?search=nike&min_price=10000&max_price=30000&sort_by=price_asc"
```

### Get products on sale
```bash
curl -X GET "http://localhost:8000/api/v1/products/on-sale"
```

### Login
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"client1@example.com","password":"password123"}'
```

### Add to cart (authenticated)
```bash
curl -X POST "http://localhost:8000/api/v1/client/cart/add" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"product_id":1,"quantity":2}'
```

---

For more information, see [GUIDE_COMMANDES.md](./GUIDE_COMMANDES.md) for the complete order management workflow.
