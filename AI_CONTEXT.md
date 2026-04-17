# AI_CONTEXT.md — Pricing App (MVP)

> **Consulte este arquivo antes de criar qualquer novo componente ou tela.**

---

## 1. Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript (Vite) |
| Estilização | Tailwind CSS v4 + shadcn/ui |
| Validação | React Hook Form + Zod |
| Estado Global | Zustand |
| Backend / BaaS | Supabase (PostgreSQL 17 + Auth + RLS) |
| Roteamento | React Router v7 |
| Testes | Vitest + jsdom + React Testing Library |
| Lint / Format | ESLint 9 (flat config) + Prettier |

---

## 2. Supabase — Credenciais

| Chave | Valor |
|---|---|
| Project ID | `[SEU_PROJECT_ID]` |
| API URL | `https://[SEU_PROJECT_ID].supabase.co` |
| Anon Key | `[SUA_ANON_KEY_AQUI]` |

> As credenciais devem ser consumidas via variáveis de ambiente (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`).

---

## 3. Regras de Autenticação

- Fluxo **estritamente via E-mail e Senha** (Supabase Auth).
- **NÃO** implementar login anônimo / guest.
- **NÃO** implementar confirmação de e-mail (desabilitado).
- Todas as rotas de negócio devem ser **protegidas**: sem sessão ativa → redirecionar para `/login`.
- Row Level Security (RLS) habilitado em **todas** as tabelas; cada registro é filtrado por `user_id = auth.uid()`.

---

## 4. Modelo de Dados (PostgreSQL)

### 4.1 `categories`
| Coluna | Tipo | Restrições |
|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` |
| user_id | uuid | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE |
| name | text | NOT NULL |
| created_at | timestamptz | default `now()` |

### 4.2 `ingredients`
| Coluna | Tipo | Restrições |
|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` |
| user_id | uuid | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE |
| name | text | NOT NULL |
| unit_of_measure | text | NOT NULL — `'g'`, `'ml'`, `'un'` |
| purchase_price | numeric | NOT NULL |
| purchase_quantity | numeric | NOT NULL |
| created_at | timestamptz | default `now()` |

> **Custo por unidade base** = `purchase_price / purchase_quantity`

### 4.3 `products`
| Coluna | Tipo | Restrições |
|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` |
| user_id | uuid | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE |
| category_id | uuid | FK → `categories(id)` ON DELETE SET NULL |
| name | text | NOT NULL |
| profit_margin_desired | numeric | NOT NULL, default `0` |
| delivery_fee_percentage | numeric | NOT NULL, default `0` |
| fixed_costs_allowance | numeric | NOT NULL, default `0` |
| created_at | timestamptz | default `now()` |

### 4.4 `product_ingredients` (tabela pivô)
| Coluna | Tipo | Restrições |
|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` |
| product_id | uuid | NOT NULL, FK → `products(id)` ON DELETE CASCADE |
| ingredient_id | uuid | NOT NULL, FK → `ingredients(id)` ON DELETE CASCADE |
| quantity_used | numeric | NOT NULL |

---

## 5. Motor de Cálculo (Fórmulas)

```
Custo Unitário do Ingrediente = purchase_price / purchase_quantity

Custo Total da Receita = Σ (custo_unitário_ingrediente × quantity_used)

Custo com Fixos = custo_total_receita + fixed_costs_allowance

Markup = 1 - (delivery_fee_percentage / 100) - (profit_margin_desired / 100)

Preço Sugerido de Venda = custo_com_fixos / markup

Lucro Líquido Esperado = preço_sugerido - custo_com_fixos - (preço_sugerido × delivery_fee_percentage / 100)
```

---

## 6. Estrutura de Pastas (convenção)

```
src/
├── components/       # Componentes reutilizáveis (UI)
│   ├── Atoms/        # Componentes simples e reutilizáveis (buttons, inputs, etc)
│   ├── Molecules/    # Combinações de átomos para criar componentes mais complexos
│   ├── Organisms/    # Combinações de moléculas para criar componentes ainda mais complexos
│   ├── Templates/    # Templates do layout (Dashboard Layout)
├── constants/        # Constantes (units, currencies, etc)
├── hooks/            # Custom hooks (useAuth, useIngredients…)
├── lib/              # Configurações (supabase client, utils)
├── pages/            # Telas (Login, Register, Dashboard…)
├── routes/           # Definição de rotas + ProtectedRoute
├── stores/           # Zustand stores
├── types/            # Tipos TypeScript (database, domain)
├── utils/            # Funções puras (pricing engine, conversions)
│   └── __tests__/    # Testes unitários das funções puras
└── main.tsx
```

---

## 7. Convenções de Código

- Imports organizados: `react` → `módulos externos` → `~/internos` → `relativos`.
- Sem `console.log` em produção (warning via ESLint).
- Imports não usados são removidos automaticamente (`unused-imports`).
- Todos os componentes interativos devem ter `id` único para testes.
- Usar `~` como alias para `src/` (configurado no Vite e TSConfig).
