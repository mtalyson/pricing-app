# Smart Pricing App 🍳💰

O **Smart Pricing App** é uma aplicação web voltada para a gestão de custos e precificação inteligente de produtos gastronômicos. Ideal para empreendedores, confeiteiros e donos de restaurantes que precisam de precisão na hora de calcular fichas técnicas e definir o preço final de venda dos seus produtos.

## 🚀 Funcionalidades

- **Autenticação:** Sistema seguro de Login e Registro.
- **Gestão de Ingredientes:** Cadastro de ingredientes com unidades de medida (g, kg, ml, l, un), preço e quantidade de compra para cálculo automático do custo unitário.
- **Categorização:** Organização de produtos por categorias personalizadas.
- **Fichas Técnicas (Receitas):** Criação de produtos compostos por múltiplos ingredientes. O custo total da receita é calculado automaticamente em tempo real com base na quantidade utilizada.
- **Painel de Precificação Inteligente:** 
  - Inclusão de Taxa de Delivery (%).
  - Inclusão de Custos Fixos (R$).
  - Definição de Margem de Lucro desejada (%).
  - Cálculo automático de Preço Sugerido, Custo Total, Markup e Lucro Esperado.
  - Alertas de viabilidade (ex: quando taxas e lucro ultrapassam 100%).

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com ferramentas modernas do ecossistema front-end:

- **[React 18](https://react.dev/)** + **[TypeScript](https://www.typescriptlang.org/)**
- **[Vite](https://vitejs.dev/)** - Ferramenta de build extremamente rápida.
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Estilização utilitária com a nova sintaxe `bg-linear-*`.
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Gerenciamento de estados globais leve e performático.
- **[Supabase](https://supabase.com/)** - Backend as a Service (Banco de Dados PostgreSQL e Autenticação).
- **[Lucide React](https://lucide.dev/)** - Biblioteca de ícones elegantes.
- **[React Router DOM](https://reactrouter.com/)** - Roteamento da aplicação.

## 📦 Como rodar o projeto localmente

1. Clone o repositório.
2. Certifique-se de ter o Node.js instalado.
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Configure as variáveis de ambiente baseadas no `.env.example` (se houver) para se conectar com o seu Supabase:
   ```env
   VITE_SUPABASE_URL=sua_url
   VITE_SUPABASE_ANON_KEY=sua_chave
   ```
5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
6. Acesse no navegador: `http://localhost:5173/` (ou a porta informada no terminal).

## 🧑‍💻 Scripts Disponíveis

- `npm run dev`: Inicia o servidor local de desenvolvimento.
- `npm run build`: Cria a versão otimizada para produção.
- `npm run lint`: Analisa o código em busca de erros usando ESLint.
- `npm run preview`: Inicia um servidor local para testar o build de produção.
