# CarPaper — AI Skill

## Capability
Vehicle management app for tracking inspections, taxes, fuel consumption, accidents/fines, and insurance.
Supports multiple vehicles. Integrates with Budget (expense export), Calendar (event creation), and Reminders (yearly alerts).

## Auth
All endpoints require JWT: `Authorization: Bearer <token>`

## API Endpoints

### Vehicles
- **GET /api/carpaper/vehicles** — List all vehicles
  - Response: `[{ id, plate, brand, model, year, color, km, fuel_type, engine_size, created_at }]`

- **POST /api/carpaper/vehicles** — Create vehicle
  - Body: `{ plate, brand, model, year?, color?, km?, fuel_type?, engine_size? }`
  - Response: `{ ok: true, id }`

- **PUT /api/carpaper/vehicles/:id** — Update vehicle
  - Body: `{ plate?, brand?, model?, year?, color?, km?, fuel_type?, engine_size? }`
  - Response: `{ ok: true }`

- **DELETE /api/carpaper/vehicles/:id** — Delete vehicle (cascades all records)
  - Response: `{ ok: true }`

### Inspections (Muayene)
- **GET /api/carpaper/inspections** — List inspections (optional `?vehicle_id=ID`)
  - Response: `[{ id, vehicle_id, date, next_date, amount, result, notes, created_at }]`

- **POST /api/carpaper/inspections** — Add inspection
  - Body: `{ vehicle_id, date, next_date?, amount?, result? ("passed"|"failed"), notes? }`
  - Response: `{ ok: true, id }`

- **PUT /api/carpaper/inspections/:id** — Update inspection
  - Body: same partial fields
  - Response: `{ ok: true }`

- **DELETE /api/carpaper/inspections/:id** — Delete inspection
  - Response: `{ ok: true }`

### Taxes (Vergi)
- **GET /api/carpaper/taxes** — List taxes (optional `?vehicle_id=ID`)
  - Response: `[{ id, vehicle_id, date, next_date, amount, description, notes, created_at }]`

- **POST /api/carpaper/taxes** — Add tax record
  - Body: `{ vehicle_id, date, next_date?, amount?, description?, notes? }`
  - Response: `{ ok: true, id }`

- **PUT /api/carpaper/taxes/:id** — Update tax record
- **DELETE /api/carpaper/taxes/:id** — Delete tax record

### Fuel Logs (Yakıt)
- **GET /api/carpaper/fuellogs** — List fuel logs (optional `?vehicle_id=ID`)
  - Response: `[{ id, vehicle_id, date, station, liters, price_per_liter, amount, total_km, notes, created_at }]`

- **POST /api/carpaper/fuellogs** — Add fuel log
  - Body: `{ vehicle_id, date, station?, liters, price_per_liter, amount, total_km?, notes? }`
  - Response: `{ ok: true, id }`

- **PUT /api/carpaper/fuellogs/:id** — Update fuel log
- **DELETE /api/carpaper/fuellogs/:id** — Delete fuel log

### Accidents/Fines (Kaza/Ceza)
- **GET /api/carpaper/accidents** — List accidents/fines (optional `?vehicle_id=ID`)
  - Response: `[{ id, vehicle_id, date, type, amount, description, notes, created_at }]`
  - type: "accident" | "fine" | "other"

- **POST /api/carpaper/accidents** — Add accident/fine
  - Body: `{ vehicle_id, date, type, amount?, description?, notes? }`
  - Response: `{ ok: true, id }`

- **PUT /api/carpaper/accidents/:id** — Update accident/fine
- **DELETE /api/carpaper/accidents/:id** — Delete accident/fine

### Insurance (Sigorta)
- **GET /api/carpaper/insurances** — List insurances (optional `?vehicle_id=ID`)
  - Response: `[{ id, vehicle_id, date, amount, provider, policy_no, expiry_date, insurance_type, notes, created_at }]`
  - insurance_type: "kasko" | "traffic"

- **POST /api/carpaper/insurances** — Add insurance
  - Body: `{ vehicle_id, date, amount?, provider?, policy_no?, expiry_date?, insurance_type?, notes? }`
  - Response: `{ ok: true, id }`

- **PUT /api/carpaper/insurances/:id** — Update insurance
- **DELETE /api/carpaper/insurances/:id** — Delete insurance

### Summary/Statistics
- **GET /api/carpaper/summary** — Get expense summary (optional `?vehicle_id=ID`)
  - Response:
    ```json
    {
      "totalExpenses": 12500,
      "inspectionTotal": 800,
      "taxTotal": 2000,
      "fuelTotal": 8000,
      "accidentTotal": 1200,
      "insuranceTotal": 500,
      "avgConsumption": 7.2,
      "vehicleCount": 2,
      "nextInspection": { "date": "2026-08-15", "days": 103 },
      "nextTax": { "date": "2026-07-01", "days": 58 }
    }
    ```

## Integration Endpoints

### Export to Budget
POST `/api/budget/entries` with:
```json
{
  "type": "expense",
  "amount": 250.00,
  "category_id": null,
  "description": "34 ABC 123 Toyota Corolla — Muayene",
  "date": "2025-06-15",
  "paid": true,
  "recurring": "",
  "notify": false,
  "show_calendar": false
}
```

### Set Reminder (Yearly)
POST `/api/reminders` with:
```json
{
  "title": "🔧 Muayene — 34 ABC 123",
  "note": "",
  "datetime": "2026-06-15T09:00",
  "repeat": "yearly",
  "sound": true
}
```

### Add to Calendar
POST `/api/calendar` with:
```json
{
  "date": "2026-06-15",
  "title": "🔧 Muayene — 34 ABC 123",
  "color": "#e74c3c"
}
```

## Data Schemas

### Vehicle
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Auto-increment PK |
| plate | TEXT | License plate |
| brand | TEXT | Car brand (Toyota, BMW...) |
| model | TEXT | Car model (Corolla, 320i...) |
| year | INTEGER | Manufacture year |
| color | TEXT | Car color |
| km | INTEGER | Current mileage |
| fuel_type | TEXT | gasoline, diesel, lpg, electric, hybrid |
| engine_size | TEXT | Engine displacement (cc) |

### Inspection
| Field | Type | Description |
|-------|------|-------------|
| vehicle_id | INTEGER | FK to vehicles |
| date | TEXT | Inspection date (YYYY-MM-DD) |
| next_date | TEXT | Next inspection date |
| amount | REAL | Cost |
| result | TEXT | passed / failed |
| notes | TEXT | Additional notes |

### Tax
| Field | Type | Description |
|-------|------|-------------|
| vehicle_id | INTEGER | FK to vehicles |
| date | TEXT | Payment date |
| next_date | TEXT | Next payment date |
| amount | REAL | Tax amount |
| description | TEXT | Tax type/description |

### Fuel Log
| Field | Type | Description |
|-------|------|-------------|
| vehicle_id | INTEGER | FK to vehicles |
| date | TEXT | Fill-up date |
| station | TEXT | Gas station name |
| liters | REAL | Liters filled |
| price_per_liter | REAL | Price per liter |
| amount | REAL | Total cost |
| total_km | INTEGER | Odometer reading |

### Accident/Fine
| Field | Type | Description |
|-------|------|-------------|
| vehicle_id | INTEGER | FK to vehicles |
| date | TEXT | Incident date |
| type | TEXT | accident / fine / other |
| amount | REAL | Cost or fine amount |
| description | TEXT | Details |

### Insurance
| Field | Type | Description |
|-------|------|-------------|
| vehicle_id | INTEGER | FK to vehicles |
| date | TEXT | Start date |
| amount | REAL | Premium amount |
| provider | TEXT | Insurance company |
| policy_no | TEXT | Policy number |
| expiry_date | TEXT | Expiry date |
| insurance_type | TEXT | kasko / traffic |

## Example AI Scenarios

1. **"Arabamın muayenesi ne zaman?"** → GET /api/carpaper/inspections → find latest next_date
2. **"Benzin harcamam ne kadar oldu?"** → GET /api/carpaper/fuellogs → sum amounts
3. **"34 ABC 123 plakalı araca yakıt girişi yap, 45 litre, 42.50 TL/lt"** → POST /api/carpaper/fuellogs
4. **"Tüm araç masraflarımı bütçeye aktar"** → GET all records → POST each to /api/budget/entries
5. **"Muayene hatırlatıcısı kur"** → POST /api/reminders with yearly repeat
6. **"Ortalama yakıt tüketimim ne kadar?"** → GET /api/carpaper/summary → avgConsumption
7. **"Sigorta bitiş tarihim ne zaman?"** → GET /api/carpaper/insurances → check expiry_date
8. **"Yeni araç ekle: 06 XY 789, Volkswagen Golf 2023"** → POST /api/carpaper/vehicles

## Storage
SQLite tables per user: `carpaper_vehicles`, `carpaper_inspections`, `carpaper_taxes`, `carpaper_fuellogs`, `carpaper_accidents`, `carpaper_insurances`
