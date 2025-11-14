Cara uji API di Postman 

Semua endpoint base: http://localhost:9000/api

1) Register Mine Planner

Method: POST

URL: http://localhost:9000/api/auth/register/mine

Body (JSON):

{
  "nama": "Joko Mine",
  "email": "joko.mine@example.com",
  "no_telp": "08123456789",
  "password": "password123"
}


Response 201:

{
  "message": "Registrasi berhasil (Mine Planner)",
  "user": { "id": "...", "nama": "Joko Mine", "email": "joko.mine@example.com" },
  "token": "eyJ..."
}

2) Register Shipping Planner

POST http://localhost:9000/api/auth/register/shipping

Body contoh:

{
  "nama": "Sari Shipping",
  "email": "sari.ship@example.com",
  "no_telp": "08123456788",
  "password": "password123"
}

3) Login (keduanya)

POST http://localhost:9000/api/auth/login

Body:

{
  "email": "joko.mine@example.com",
  "password": "password123",
  "role": "mine_planner"
}


Response: token + user info. Simpan token di Postman (Authorization → Bearer Token).

4) Mine Planner membuat Order

POST http://localhost:9000/api/orders

Header: Authorization: Bearer <token_mine>

Body:

{
  "origin": "Tambang A",
  "destination": "Pelabuhan B",
  "cargo_type": "Nickel",
  "cargo_weight_tons": 1500,
  "transport_mode": "Vessel",
  "distance_km": 120,
  "planned_departure": "2025-11-20T08:00:00Z"
}


Response: order object

5) Shipping Planner membuat Schedule (untuk order)

POST http://localhost:9000/api/schedules

Header: Authorization: Bearer <token_shipping>

Body:

{
  "orderId": "<order-id-dari-step-4>",
  "vessel_name": "MV Armada 1",
  "departure_time": "2025-11-21T10:00:00Z",
  "arrival_time": "2025-11-22T04:00:00Z",
  "road_condition_status": "Good",
  "weather_condition": "Clear",
  "cost_usd": 3500,
  "notes": "Siapkan dokumen ekspor"
}


Response: schedule object, dan order.status akan jadi Scheduled

6) Update schedule status (Shipping)

PUT http://localhost:9000/api/schedules/:scheduleId

Header: Authorization: Bearer <token_shipping>

Body:

{
  "status": "Ongoing",
  "notes": "Berangkat dari pelabuhan",
  "road_condition_status": "Good",
  "weather_condition": "Clear"
}


Response: updated schedule; bila status Ongoing maka order.status => In Transit

7) Get orders milik Mine Planner

GET http://localhost:9000/api/orders/mine

Header: Authorization: Bearer <token_mine>

8) List schedules (Shipping Planner)

GET http://localhost:9000/api/schedules

Header: Authorization: Bearer <token_shipping>