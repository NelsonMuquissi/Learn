# 📊 ANÁLISE COMPLETA DA BASE DE DADOS — KACIFO LOCK CONNECT
## Projeto Supabase: psmqngrewfzwouwfhfjr
---

## 1. VISÃO GERAL

| Métrica | Valor |
|---------|-------|
| Total de Tabelas | 32 |
| Total de Views | 2 |
| Enums Customizados | 7 |
| Todas as tabelas com RLS | ✅ Sim |

---

## 2. ENUMS CUSTOMIZADOS

| Enum | Valores |
|------|---------|
| `blocked_locker_status` | blocked, resolved, paid |
| `booking_status` | pending_dropoff, awaiting_pickup, ready_for_pickup, awaiting_payment, completed, cancelled |
| `event_type` | storage, delivery |
| `payment_status` | pending, processing, completed, failed, refunded, cancelled |
| `reservation_source` | app, web, partner, admin |
| `reservation_status` | pending, awaiting_payment, active, completed, cancelled, expired, overdue |
| `resolution_type` | payment, admin_override, expired, manual |

⚠️ **PROBLEMA:** As tabelas usam `text` em vez dos enums definidos! Apenas `payments.status` usa o enum `payment_status`. As colunas `active_reservations.status`, `booking_status`, `event_type`, `reservation_source` são todas `text`, desperdiçando a validação dos enums.

---

## 3. TABELAS — ANÁLISE DETALHADA

### 3.1 `active_reservations` (P0 — Core do Negócio)

| Coluna | Tipo | Nullable | Default | Notas |
|--------|------|----------|---------|-------|
| id | uuid | NO | gen_random_uuid() | PK |
| user_id | uuid | **YES** | - | ⚠️ FK ausente, nullable com RLS |
| device_id | text | NO | - | ⚠️ Sem FK para devices |
| location_id | text | NO | - | ⚠️ Sem FK para locations |
| koloni_event_id | text | YES | - | ID externo Koloni |
| start_time | timestamptz | NO | now() | |
| end_time | timestamptz | NO | - | |
| paid_minutes | integer | NO | - | |
| status | text | NO | 'active' | ⚠️ Deveria ser enum reservation_status |
| payment_intent_id | text | YES | - | |
| amount_paid | numeric | YES | - | |
| currency | text | YES | - | |
| unlock_code | text | YES | - | |
| invoice_id | text | YES | - | |
| order_number | text | YES | - | |
| size_id | text | YES | - | ⚠️ Sem FK para sizes |
| tracking_number | text | YES | - | |
| payment_reference_id | text | YES | - | |
| sms_resend_count | integer | YES | 0 | |
| event_type | text | YES | 'storage' | ⚠️ Deveria ser enum |
| recipient_phone | text | YES | - | |
| recipient_name | text | YES | - | |
| sms_sent | boolean | YES | false | |
| booking_status | text | YES | 'pending_dropoff' | ⚠️ Deveria ser enum |
| booking_expires_at | timestamptz | YES | - | |
| dropoff_event_id | text | YES | - | |
| dropoff_code | text | YES | - | |
| dropoff_completed_at | timestamptz | YES | - | |
| pickup_event_id | text | YES | - | |
| pickup_code | text | YES | - | |
| pickup_completed_at | timestamptz | YES | - | |
| reservation_source | text | YES | 'app' | ⚠️ Deveria ser enum |
| pickup_code_locked | boolean | YES | false | |
| koloni_user_id | text | YES | - | |
| parent_reservation_id | uuid | YES | - | FK → self |
| payer_responsibility | text | YES | 'sender' | |
| created_at | timestamptz | NO | now() | |
| updated_at | timestamptz | NO | now() | |

**Índices (16):** ✅ Bem indexada
- PK: `id`
- `idx_active_reservations_booking_status` (booking_status)
- `idx_active_reservations_created_at` (created_at DESC)
- `idx_active_reservations_device_id` (device_id)
- `idx_active_reservations_dropoff_event_id` (dropoff_event_id) WHERE NOT NULL
- `idx_active_reservations_end_time` (end_time)
- `idx_active_reservations_event_type` (event_type)
- `idx_active_reservations_koloni_event_id` (koloni_event_id)
- `idx_active_reservations_koloni_user_id` (koloni_user_id) WHERE NOT NULL
- `idx_active_reservations_location_id` (location_id)
- `idx_active_reservations_parent` (parent_reservation_id) WHERE NOT NULL
- `idx_active_reservations_pickup_event_id` (pickup_event_id) WHERE NOT NULL
- `idx_active_reservations_recipient_phone` (recipient_phone) WHERE NOT NULL
- `idx_active_reservations_status` (status)
- `idx_active_reservations_user_id` (user_id)
- `unique_active_reservation_per_user_device` UNIQUE (user_id, device_id) WHERE status='active'

**RLS Policies (5):**
- SELECT: Users own + Recipients by phone
- INSERT: user_id = auth.uid()
- UPDATE: user_id = auth.uid()
- DELETE: user_id = auth.uid()

**Stats:** 4 rows, 33 dead rows, 520 KB total

---

### 3.2 `payment_metadata` (P0 — Financeiro)

| Coluna | Tipo | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| reference_id | text | NO | - |
| user_id | uuid | YES | - |
| metadata | jsonb | NO | - |
| status | text | NO | 'pending' |
| transaction_id | text | YES | - |
| expires_at | timestamptz | NO | - |
| processed_at | timestamptz | YES | - |
| error_message | text | YES | - |
| created_at | timestamptz | NO | now() |

**Índices:** PK + reference_id UNIQUE + status + user_id + expires_at
**Stats:** 9 rows, 18 dead rows, 696 KB

---

### 3.3 `profiles` (P0 — Dados do Utilizador)

| Coluna | Tipo | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| user_id | uuid | NO | - |
| full_name | text | YES | - |
| phone | text | YES | - |
| email | text | YES | - |
| avatar_url | text | YES | - |
| preferred_language | text | YES | 'pt' |
| notification_preferences | jsonb | YES | '{"sms":true,"push":true,"email":true}' |
| created_at | timestamptz | NO | now() |
| updated_at | timestamptz | NO | now() |

**Índices:** PK + user_id UNIQUE
**Stats:** 0 rows (!), 48 KB
⚠️ **CRÍTICO:** 0 rows na tabela profiles indica que os perfis não estão sendo persistidos corretamente!

---

### 3.4 `reservation_slots` (P1 — Faturação)

| Coluna | Tipo | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| booking_id | uuid | NO | - |
| device_id | text | NO | - |
| koloni_event_id | text | NO | - |
| event_code | text | NO | - |
| slot_number | integer | NO | - |
| price_cents | integer | NO | - |
| paid | boolean | NO | false |
| user_id | uuid | YES | - |
| koloni_user_id | text | YES | - |
| koloni_status | text | NO | 'created' |
| expires_at | timestamptz | NO | - |
| closed_at | timestamptz | YES | - |
| created_at | timestamptz | NO | now() |

**Índices (10):** Bem indexada
**Stats:** 10 rows, 14 dead rows, 504 KB

---

### 3.5 `webhook_logs` (P1 — Auditoria)

**Stats:** 36 rows, 0 dead rows, 3256 KB (segunda maior!)

### 3.6 `sms_logs` (P1)

**Stats:** 30 rows, 9 dead rows, 520 KB

### 3.7 `user_debts` (P2)

**Stats:** 3 rows, 11 dead rows, 264 KB

### 3.8 `payments` (P0)

**Stats:** 4 rows, 9 dead rows, 200 KB

---

## 4. VIEWS

| View | Definição |
|------|-----------|
| `reservations_with_payments` | (definição não acessível via API) |
| `delivery_recipient_reservations` | (definição não acessível via API) |

---

## 5. TRIGGERS

**Resultado: 0 triggers encontrados via information_schema.**

⚠️ **INCONSISTÊNCIA:** O código SQL das funções mostra triggers definidos (ex: `sync_unpaid_slot_to_debts`, `sync_reservation_on_slot_payment`, `update_updated_at_column`), mas information_schema não os lista. Possível que os triggers existam mas não sejam visíveis via esta query — verificar via `pg_trigger`.

---

## 6. FOREIGN KEYS

**Resultado: 0 foreign keys encontradas via information_schema.**

⚠️ **CRÍTICO:** Nenhuma FK detectada! Isto é inconsistente com o types.ts que lista FKs como:
- `active_reservations.parent_reservation_id → active_reservations.id`
- `devices.location_id → locations.id`
- `devices.size_id → sizes.id`
- `reservation_slots.booking_id → active_reservations.id`
- `payments.reservation_id → active_reservations.id`
- `b2b_company_users.company_id → b2b_companies.id`
- etc.

Possível que as FKs existam mas o utilizador da API não tem permissão para ver `information_schema.table_constraints`.

---

## 7. ESTATÍSTICAS DE TAMANHO (Ordenado por tamanho)

| Tabela | Total | Rows | Dead Rows | Ratio Dead/Live |
|--------|-------|------|-----------|-----------------|
| admin_notifications | 3920 KB | 0 | 0 | - |
| webhook_logs | 3256 KB | 36 | 0 | 0% |
| payment_metadata | 696 KB | 9 | 18 | 200% ⚠️ |
| sms_logs | 520 KB | 30 | 9 | 30% |
| active_reservations | 520 KB | 4 | 33 | **825%** 🔴 |
| reservation_slots | 504 KB | 10 | 14 | 140% ⚠️ |
| user_debts | 264 KB | 3 | 11 | 367% ⚠️ |
| blocked_lockers | 216 KB | 0 | 0 | - |
| payments | 200 KB | 4 | 9 | 225% ⚠️ |
| koloni_user_tokens | 120 KB | 9 | 23 | 256% ⚠️ |
| phone_verification_otps | 88 KB | 1 | 33 | 3300% 🔴 |
| profiles | 48 KB | **0** | 0 | 🔴 0 perfis! |

---

## 8. 🔴 PROBLEMAS CRÍTICOS ENCONTRADOS

### P0 — Segurança e Integridade

| # | Problema | Impacto | Solução |
|---|----------|---------|---------|
| 1 | **Enums definidos mas não usados** — Colunas `status`, `booking_status`, `event_type` são `text` em vez dos enums | Valores inválidos podem ser inseridos | ALTER COLUMN ... TYPE enum USING |
| 2 | **user_id nullable em active_reservations** — RLS usa `auth.uid() = user_id` mas user_id pode ser NULL | Reservas sem dono não são protegidas por RLS | Avaliar se nullable é necessário |
| 3 | **0 perfis na tabela profiles** — Perfis não estão sendo criados/persistidos | Dados do utilizador perdidos | Verificar hook useProfile |
| 4 | **FKs possivelmente ausentes** — Sem referential integrity em device_id, location_id, size_id | Dados órfãos possíveis | Adicionar FKs |

### P1 — Performance

| # | Problema | Impacto | Solução |
|---|----------|---------|---------|
| 5 | **Dead rows excessivos** — active_reservations: 825%, phone_verification_otps: 3300% | Bloat, queries lentas | VACUUM ANALYZE |
| 6 | **admin_notifications: 3.9 MB com 0 rows** — Tabela vazia mas ocupando espaço | Storage desperdício | VACUUM FULL |
| 7 | **webhook_logs: 3.2 MB com 36 rows** — Payloads JSONB grandes | Crescimento rápido | Partitioning/archival |

### P2 — Arquitectura

| # | Problema | Impacto | Solução |
|---|----------|---------|---------|
| 8 | **Sem soft delete** — Nenhuma tabela tem `deleted_at` | Dados irrecuperáveis | Adicionar coluna + política |
| 9 | **Triggers possivelmente inconsistentes** — Funções definidas mas triggers não visíveis | Lógica de negócio pode não executar | Verificar pg_trigger |
| 10 | **Tabela monolítica active_reservations** — 37 colunas misturando storage + delivery | Complexidade, nulls excessivos | Considerar tabela delivery_details |

---

## 9. 🟢 PONTOS POSITIVOS

1. **✅ RLS habilitado em TODAS as 32 tabelas** — Excelente cobertura de segurança
2. **✅ Índices abrangentes em active_reservations** — 16 índices, incluindo parciais e compostos
3. **✅ Unique constraints importantes** — `admin_users.user_id`, `unique_active_reservation_per_user_device`
4. **✅ Enums bem definidos** — 7 enums com valores de negócio claros
5. **✅ Funções SECURITY DEFINER** — `is_admin`, `has_role`, `get_user_phone` evitam recursão RLS

---

## 10. RECOMENDAÇÕES PRIORITÁRIAS

### Imediato (Sprint atual)
1. Investigar porque `profiles` tem 0 rows
2. Executar `VACUUM ANALYZE` nas tabelas com high dead row ratio
3. Verificar triggers via `SELECT * FROM pg_trigger`

### Curto prazo (1-2 semanas)
4. Migrar colunas text → enum (status, booking_status, event_type)
5. Adicionar FKs missing (device_id → devices, location_id → locations)
6. Implementar archival para webhook_logs e sms_logs

### Médio prazo (1 mês)
7. Separar active_reservations em tabelas storage vs delivery
8. Adicionar soft delete (`deleted_at`) nas tabelas críticas
9. Implementar partitioning temporal em webhook_logs
10. Criar materialized views para analytics
