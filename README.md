```markdown
# VixSys ERP

Sistema ERP completo, moderno e leve desenvolvido em **um único arquivo HTML** usando React 18 via CDN.

Ideal para gestão empresarial integrada, incluindo Comercial, Produção, Estoque, Logística e Financeiro.

---

## ✨ Funcionalidades

- Interface moderna e responsiva
- Totalmente offline (funciona sem servidor)
- Persistência de dados via `localStorage`
- Múltiplos módulos integrados:
  - Dashboard com KPIs
  - Cadastro de Clientes e Produtos
  - Pedidos de Venda
  - Controle de Estoque
  - Ordens de Produção
  - Gestão Logística (Entregas, Veículos, Motoristas)
  - Financeiro (Contas a Receber / Pagar)
- CRUD completo em todos os módulos
- Design System consistente (Tailwind + tokens personalizados)

---

## 🚀 Como Executar

### Localmente

1. Baixe o arquivo `index.html`
2. Abra o arquivo diretamente no navegador (duplo clique)
3. Pronto! O sistema funciona 100% offline

### Online (Vercel)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ogabrielcavalieri/vixsys-erp)

Acesse: [https://vixsys-erp.vercel.app](https://vixsys-erp.vercel.app) (link será atualizado após o deploy)

---

## 📁 Estrutura do Projeto

```
vixsys-erp/
├── index.html          ← Arquivo principal (todo o sistema)
├── vercel.json         ← Configuração para SPA no Vercel
└── README.md
```

---

## 🛠️ Tecnologias Utilizadas

- **React 18** (via CDN - UMD)
- **Tailwind CSS** (via Play CDN)
- **React Context + useReducer** (gerenciamento de estado)
- **localStorage** (persistência)
- HTML5 + CSS3 + Vanilla JS
- Google Fonts (DM Sans + DM Mono)

---

## ⚠️ Observações Importantes

- Este é um **Single File Application** — todo o código está concentrado em `index.html`
- Não requer instalação de Node.js, npm ou qualquer build tool
- Recomendado para uso interno da empresa ou demonstração
- Dados são salvos apenas no navegador atual (localStorage)

---

## 📌 Próximos Passos (Roadmap)

- [ ] Implementar módulo Financeiro completo
- [ ] Adicionar login simulado com múltiplos usuários
- [ ] Exportar/Importar dados (JSON)
- [ ] Relatórios em PDF
- [ ] Modo escuro (Dark Mode)

---

## 👨‍💻 Desenvolvido por

**Gabriel Cavalieri**

---

⭐ Se este projeto te ajudou, considere dar uma estrela no repositório!

```

---

### Como usar:

1. Crie um arquivo chamado **`README.md`** na raiz do seu projeto
2. Cole todo o conteúdo acima
3. Salve o arquivo
4. Faça o commit:

```powershell
git add README.md
git commit -m "docs: adiciona README.md"
git push
```
