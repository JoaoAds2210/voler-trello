Kit de Tools da API do Trello — TypeScript

Kit de funções em TypeScript para um agente interagir com a API REST do
Trello: localizar um card, comentar nele, alterar etiquetas, mover entre
listas e marcar itens de checklist. Construído e validado contra um board
real do Trello.

Critérios de aceitação cobertos

#CritérioFunçãoDocumentação1Localizar card pelo IDgetCardByIdtools.md2Comentário com resumo + link do PDFpostActionCommenttools.md3Alterar/adicionar etiquetassetCardLabelsByNametools.md4Mover entre listas + marcar checklistmoveCardToListByName, setChecklistItemStatetools.md

Estrutura do projeto

trello-toolkit-ts/
├── docs/
│   ├── types.md          # o "contrato de dados" — formato de cada resposta da API
│   ├── config.md           # autenticação (API Key + Token)
│   ├── client-http.md        # camada HTTP genérica (fetch, generics, tratamento de erro)
│   └── tools.md                # as funções de negócio (os 4 critérios de aceitação)
├── src/
│   ├── types.ts           # interfaces/types dos dados do Trello
│   ├── config.ts            # carregamento de credenciais
│   ├── client.ts              # cliente HTTP (trelloGet/Post/Put/Delete)
│   └── tools.ts                  # funções públicas (as 5 do critério de aceitação)
├── package.json
└── tsconfig.json

Cada arquivo em src/ tem seu par em docs/, explicando o que faz, por
que foi construído daquele jeito, e quais decisões de design foram
tomadas — inclusive erros reais encontrados e corrigidos durante os
testes contra a API real.

Como as camadas se conectam

types.ts   → define o FORMATO dos dados (Card, Label, TrelloList, Checklist...)
   ↓ usado por
config.ts  → carrega e valida as CREDENCIAIS (TRELLO_API_KEY, TRELLO_TOKEN)
   ↓ usado por
client.ts  → fala HTTP com a API (trelloGet/Post/Put/Delete), genérico
   ↓ usado por
tools.ts   → as 5 funções de negócio, uma por critério de aceitação

Cada camada só depende da anterior — nunca o contrário.

Setup

1. Instalar dependências

powershellnpm install

2. Gerar credenciais do Trello


Acesse trello.com/power-ups/admin
(é necessário ser membro de uma Área de Trabalho — crie uma em
trello.com/create-workspace se
ainda não tiver).
Clique em New, preencha o formulário mínimo (nome do app, área de
trabalho — o campo de URL de conector Iframe pode ficar em branco).
Na aba API Key, clique em Generate a new API Key. Copie o valor.
Ao lado da API Key, clique no link Token. Autorize o acesso — o
Trello mostra um token de 64 caracteres. Copie o valor (só aparece uma
vez).


3. Configurar variáveis de ambiente

No terminal (PowerShell), antes de rodar qualquer script:

powershell$env:TRELLO_API_KEY="sua_api_key_aqui"
$env:TRELLO_TOKEN="seu_token_aqui"

Atenção: essas variáveis só valem para a sessão atual do terminal —
precisam ser redefinidas sempre que um terminal novo for aberto.

4. Validar as credenciais (opcional, fora do projeto)

Cole no navegador, substituindo pelos seus valores:

https://api.trello.com/1/members/me?key=SUA_API_KEY&token=SEU_TOKEN

Se devolver um JSON com dados do seu usuário Trello, as credenciais estão
corretas.

Uso básico

typescriptimport {
  getCardById,
  postActionComment,
  setCardLabelsByName,
  moveCardToListByName,
  setChecklistItemState,
} from "./src/tools.js";

const cardId = "abc123";
const boardId = "xyz789";

// 1. Localizar
const card = await getCardById(cardId);

// 2. Comentar com resumo + link do PDF
await postActionComment(
  cardId,
  "Minuta de resposta gerada com base no processo.",
  "https://exemplo.com/minuta.pdf",
);

// 3. Trocar etiqueta (nome deve bater EXATAMENTE com o cadastrado no Trello)
await setCardLabelsByName(cardId, boardId, "PENDÊNCIAS");

// 4. Mover de lista e marcar checklist
await moveCardToListByName(cardId, boardId, "MINUTA ELABORADA");
await setChecklistItemState(cardId, "etapa 2", "complete");

Rodando um script de teste

powershellnpx tsx src/nome-do-arquivo.ts

Verificação de tipos, sem executar nada (útil após qualquer edição):

powershellnpx tsc --noEmit

Decisões de design importantes


Comparação de nomes é case-sensitive (etiquetas, listas, itens de
checklist). "PENDÊNCIAS" ≠ "Pendências". Decisão intencional:
precisão exata sobre tolerância, para evitar ambiguidade. Detalhes em
tools.md.
pdfUrl é obrigatório em postActionComment — reflete que, no
fluxo de negócio real, todo comentário de ação sempre acompanha um PDF.
Query strings nunca são coladas manualmente na URL — sempre passadas
via o parâmetro params dos verbos HTTP em client.ts. Ver o bug real
encontrado por violar essa regra em
client-http.md.
setCardLabelsByName substitui, não acumula — "mudar para X" remove
etiquetas antigas do card antes de adicionar a nova.


Limitações conhecidas


findCheckItemByName não diferencia itens de mesmo nome em checklists
diferentes do mesmo card — usa o primeiro encontrado.
A resposta da API não é validada em tempo de execução contra os tipos
declarados (as T é uma afirmação de tipo, não uma validação de
schema). Se a API do Trello mudar um campo, o erro só apareceria em
tempo de execução.


Validação

Todas as 5 funções foram testadas manualmente contra um board real do
Trello (não apenas verificadas por compilação), com confirmação visual na
interface do Trello após cada chamada.