# Kit de Tools da API do Trello — TypeScript

Kit de funções em TypeScript para um agente interagir com a API REST do Trello: localizar um card, comentar nele, alterar etiquetas, mover entre listas e marcar itens de checklist. Construído e validado contra um board real do Trello. O projeto conta com uma arquitetura serverless mapeando Cloud Functions individuais para cada ferramenta de negócio.

## Critérios de aceitação cobertos

| # | Critério / Contexto | Função | Documentação |
|---|---|---|---|
| 1 | Localizar card pelo ID | `getCardById` | docs/tools.md |
| 2 | Comentário com resumo + link do PDF | `postActionComment` | docs/tools.md |
| 3 | Alterar/adicionar etiquetas | `setCardLabelsByName` | docs/tools.md |
| 4 | Mover entre listas + marcar checklist | `moveCardToListByName`, `setChecklistItemState` | docs/tools.md |

---

## Estrutura do projeto

```text
trello-toolkit-ts/
├── docs/
│   ├── types.md          # o "contrato de dados" — formato de cada resposta da API
│   ├── config.md         # autenticação (API Key + Token)
│   ├── client-http.md    # camada HTTP genérica (fetch, generics, tratamento de erro)
│   └── tools.md          # as funções de negócio (os 4 critérios de aceitação)
├── functions/            # Cloud Functions dedicadas e isoladas para cada tool mapeada
├── src/
│   ├── types.ts          # interfaces/types dos dados do Trello
│   ├── config.ts         # carregamento de credenciais
│   ├── client.ts         # cliente HTTP (trelloGet/Post/Put/Delete)
│   └── tools.ts          # funções públicas (as 5 do critério de aceitação)
├── package.json
└── tsconfig.json
