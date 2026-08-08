# Pacto Soluções — Plataforma de Recrutamento (Web)

[![Angular](https://img.shields.io/badge/Angular-21.2-DD0031?logo=angular&logoColor=white)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?logo=reactivex&logoColor=white)](https://rxjs.dev)
[![Vitest](https://img.shields.io/badge/Vitest-4.0-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Aplicação Angular para gestão de vagas e candidaturas. Interface web do sistema **Pacto Recrutamento** — um painel completo onde candidatos se inscrevem em vagas e administradores gerenciam o pipeline de seleção com avaliações e feedback.

---

## 🎯 Funcionalidades

### Usuário Candidato

- [x] Landing page pública com acesso a login e registro
- [x] Autenticação JWT com registro de novo usuário
- [x] Listagem de vagas abertas com hero section, busca e filtro por status
- [x] Contador de vagas disponíveis (exclui vagas já aplicadas, atualiza em tempo real)
- [x] Badge "Novo" em vagas publicadas nos últimos 7 dias
- [x] Quick Apply — candidatura direta no card, sem necessidade de navegar ao detalhe
- [x] Indicador visual "Candidatura realizada" pós-aplicação
- [x] Detalhe da vaga com descrição completa, requisitos e botão de candidatura
- [x] Dashboard pessoal com histórico de candidaturas e filtro por status

### Administrador

- [x] Painel de gerenciamento de vagas com tabela, estatísticas (total, abertas, rascunhos, encerradas) e busca
- [x] Criação de vagas com fluxo de rascunho e publicação
- [x] Botões contextuais: `[Salvar como rascunho]` e `[Criar Vaga]` com modal de confirmação de publicação
- [x] Edição de vagas — status travado como OPEN após publicação, edição apenas de campos de conteúdo
- [x] Exclusão de vagas em rascunho com modal de confirmação
- [x] Encerramento de vagas abertas
- [x] Listagem de candidaturas por vaga com status e ações
- [x] Detalhe da candidatura em layout de duas colunas (conteúdo principal + sidebar da vaga)
- [x] Transição automática PENDING → IN_REVIEW ao abrir candidatura
- [x] Avaliação do candidato com nota (1-5) e feedback textual
- [x] Fluxo encadeado: `POST /evaluation` → `PATCH /status` (aprovar/reprovar)
- [x] Exibição da avaliação registrada após submissão

---

## 🛠️ Tech Stack

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Angular | 21.2 | Framework principal — standalone components, signals, lazy loading |
| TypeScript | 5.9 | Tipagem estática e strict mode |
| Tailwind CSS | 4.1 | Design system utilitário — estilização co-localizada, zero CSS não utilizado |
| RxJS | 7.8 | Streams reativos para chamadas HTTP e fluxos encadeados (concatMap, switchMap) |
| @ng-icons/heroicons | 35 | Ícones SVG tree-shakeable |
| Vitest | 4.0 | Test runner nativo Angular — rápido e compatível com Vite |

---

## 🚀 Como Executar

### Pré-requisitos

- **Node.js** 20+
- **npm** 11+
- **Angular CLI** 21 (`npm install -g @angular/cli`)

### Setup

```bash
npm install
```

### Servidor de Desenvolvimento

```bash
npm start
# http://localhost:4200
```

O frontend espera que a API esteja rodando em `http://localhost:8080/api/v1`.  
Configure o proxy reverso ou ajuste o `proxy.conf.json` conforme necessário.

### Build de Produção

```bash
npm run build
# artefatos em dist/recrutamento
```

### Testes

```bash
npm test
```

---

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── core/
│   │   ├── guards/          # Route guards — authGuard por role (USER | ADMIN)
│   │   ├── interceptors/    # AuthInterceptor — anexa token JWT em todas as requests
│   │   ├── models/          # Interfaces TypeScript (Vacancy, Application, Evaluation, Auth, Dashboard)
│   │   └── services/        # Camada de acesso à API (Vacancy, Application, Evaluation, Auth, Dashboard)
│   ├── pages/
│   │   ├── landing/         # Página inicial pública
│   │   ├── auth/            # Login + Register
│   │   ├── vacancies/       # Listagem (hero + cards) + Detalhe da vaga
│   │   ├── dashboard/       # Painel do candidato — candidaturas por status
│   │   └── admin/           # Gerenciar vagas, formulário, lista de candidaturas, detalhe
│   └── shared/
│       └── components/      # StatusBadge, ConfirmModal, Navbar
├── app.routes.ts            # Rotas com lazy loading e guards por role
├── app.config.ts            # Providers (HttpClient, Router, AuthInterceptor)
└── index.html               # Entry point com classes Tailwind globais
```

### Convenções do Projeto

- **`@Component` sem `standalone: true`** — padrão no Angular 21+
- **Signals para estado local** — `signal()`, `computed()`, `toSignal()`
- **Sem `ngOnDestroy`** — `DestroyRef` + `takeUntilDestroyed()` para limpeza automática
- **Inline templates** em componentes pequenos, **arquivos `.html` separados** em páginas
- **`ReactiveFormsModule`** com `FormBuilder.nonNullable` para tipagem forte
- **`ChangeDetectionStrategy.OnPush`** em todos os componentes — signals + `detectChanges()` pontual

---

## 🏗️ Decisões Técnicas

| Decisão | Motivo |
|---------|--------|
| **Standalone Components** (default Angular 21) | Zero NgModules, tree-shaking nativo, menos boilerplate |
| **Signals + OnPush** | Performance previsível — sem dependência de Zone.js, reavaliação granular |
| **`toSignal` para dados GET** | Substitui `.subscribe()` manual em data fetching — limpeza automática, tipo reativo |
| **`concatMap` para fluxos sequenciais** | `avaliação → mudança de status` precisa ser sequencial — `concatMap` garante ordem e captura a resposta intermediária |
| **`switchMap` para dados com filtro reativo** | Listagem de vagas por filtro cancela requests pendentes automaticamente ao trocar parâmetros |
| **Reactive Forms + `nonNullable`** | Tipagem forte nos controles, validação síncrona, sem `*ngIf` nos templates |
| **Tailwind utilitário** | Estilização co-localizada com markup, zero CSS morto no bundle |
| **Lazy Loading por feature** | Rotas públicas (`/vacancies`) e admin (`/admin`) em chunks separados, carregamento sob demanda |
| **`AuthInterceptor` funcional** | Anexa token JWT em todas as requisições — sem boilerplate por serviço |
| **ConfirmModal como componente genérico** | Reutilizado em 4 contextos diferentes (publicar, encerrar, excluir, aprovar/reprovar) com inputs configuráveis |

---

## 🔗 Repositórios Relacionados

| Repositório | Descrição |
|-------------|-----------|
| [pacto-solucoes-recrutamento-api](https://github.com/seu-user/pacto-solucoes-recrutamento-api) | API REST em Java/Spring Boot 3 |
| [pacto-solucoes-recrutamento](https://github.com/seu-user/pacto-solucoes-recrutamento) | Repositório central com README geral e documentação |

---

## 📝 Licença

MIT © 2026
