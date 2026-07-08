tools.ts — funções de negócio (critérios de aceitação)

Visão geral

Este arquivo contém as funções públicas que um agente chama para agir
sobre o Trello. Cada uma corresponde diretamente a um dos critérios de
aceitação definidos pelo tech lead. Diferente de client.ts (genérico, sem
conhecimento de regras de negócio), aqui moram as decisões específicas do
domínio: como resolver um nome de etiqueta para o ID que a API exige, como
"mover um card" se traduz numa chamada HTTP, etc.

Todas as funções foram testadas contra um board real do Trello, não
apenas verificadas por compilação — os exemplos de payload e as decisões
de design abaixo refletem esse teste real, incluindo dois bugs encontrados
e corrigidos no processo.

Padrão comum: resolver nome → id

A API do Trello só aceita etiquetas e listas por ID, mas os critérios
de aceitação pedem para trabalhar por nome ("PENDÊNCIAS",
"MINUTA ELABORADA"). Por isso, setCardLabelsByName e
moveCardToListByName seguem o mesmo padrão de 3 camadas:


Uma função privada que busca todos os recursos daquele tipo no board
(getBoardLabels, getBoardLists).
Uma função privada que resolve o nome pedido para o ID correspondente,
lançando erro claro se não encontrar (resolveLabelId, resolveListId).
A função pública, que usa o ID resolvido para executar a ação de fato.


setChecklistItemState segue uma variação do mesmo padrão, só que
procurando um item dentro de uma lista de checklists (dois níveis de
busca, não um).

Critério 1 — Localizar card pelo ID

typescriptexport async function getCardById(cardId: string): Promise<Card>

Parâmetro: cardId — ID (24 caracteres) ou shortLink do card.

Chama GET /cards/{id}, restringindo os campos retornados via
?fields=... aos que o kit usa (id, name, desc, url, shortUrl, idBoard, idList, idLabels, idChecklists, closed) — a API devolve dezenas de campos
a mais por padrão, que não são necessários aqui.

Serve como base para as demais funções: boardId e idList retornados
aqui são reutilizados por quem for chamar setCardLabelsByName ou
moveCardToListByName em seguida.

Critério 2 — Comentário com resumo + link do PDF

typescriptexport async function postActionComment(
  cardId: string,
  summary: string,
  pdfUrl: string,
): Promise<CommentAction>

Parâmetros:


cardId — card onde postar.
summary — resumo em texto livre da ação executada.
pdfUrl — URL do PDF gerado. Obrigatório (não opcional): no fluxo de
negócio real, todo comentário de ação sempre acompanha um PDF gerado;
tornar opcional abriria brecha para postar comentários incompletos sem
que ninguém percebesse.


Monta o texto final como "{summary}\nPDF: {pdfUrl}" e chama
POST /cards/{id}/actions/comments.

Critério 3 — Alterar/adicionar etiquetas

typescriptexport async function setCardLabelsByName(
  cardId: string,
  boardId: string,
  labelName: string,
): Promise<void>

Parâmetros:


cardId — card a etiquetar.
boardId — board onde o card está (necessário para localizar as
etiquetas disponíveis por nome).
labelName — nome exato da etiqueta desejada.


Comportamento: busca a etiqueta pelo nome no board, remove do card
qualquer etiqueta diferente da desejada, e adiciona a nova. Interpretação
de "Mudar para X": substituição, não acúmulo — o card fica só com a
etiqueta informada.

Critério 4 — Mover entre listas e marcar checklist

typescriptexport async function moveCardToListByName(
  cardId: string,
  boardId: string,
  listName: string,
): Promise<void>

export async function setChecklistItemState(
  cardId: string,
  itemName: string,
  state: CheckItemState,
): Promise<void>

moveCardToListByName — resolve o nome da lista de destino para o ID
e faz PUT /cards/{id} alterando o campo idList. No Trello não existe um
endpoint de "mover"; mover é, tecnicamente, atualizar esse campo — o mesmo
mecanismo usado para editar nome ou descrição do card.

setChecklistItemState — busca todos os checklists do card
(GET /cards/{id}/checklists?checkItems=all), procura o item cujo nome
bate exatamente com itemName em todos os checklists (usa o primeiro
encontrado, na ordem em que os checklists aparecem — ver limitação
abaixo), e faz PUT /cards/{id}/checkItem/{itemId} alterando state.
state é tipado como CheckItemState ("complete" | "incomplete"), não
string livre — o compilador recusa qualquer outro valor.

Decisão de design validada nos testes: comparação case-sensitive

Ao testar contra o board real, descobrimos que os nomes reais de etiqueta
não seguiam o exemplo genérico do critério original: o board usa
"PENDÊNCIAS" (maiúsculo, acentuado), e os itens de checklist foram
criados como "etapa 1", "etapa 2", "etapa 3" (minúsculo). As três
funções de resolução por nome (resolveLabelId, resolveListId,
findCheckItemByName) comparam o nome com ===, ou seja, são
sensíveis a maiúsculas/minúsculas e acentuação.

Essa é uma decisão intencional, não uma limitação a ser corrigida:
prioriza-se correspondência exata sobre tolerância, para evitar aplicar
uma ação sobre um item diferente do pretendido por ambiguidade de nome.
O nome passado para essas funções deve bater exatamente com o nome
cadastrado no Trello (visível na interface do board).

Limitação conhecida: itens de checklist com nomes duplicados

Se um card tiver dois checklists diferentes, cada um com um item de mesmo
nome (ex: dois checklists distintos, ambos com um item "Etapa 1"),
findCheckItemByName retorna o primeiro encontrado, na ordem em que
os checklists aparecem na resposta da API — não há como especificar "no
checklist X" a partir da função pública atual. Se isso se tornar um
problema real, a extensão natural é adicionar um parâmetro opcional
checklistName a setChecklistItemState.

Bug real corrigido: URL com ? duplicado

Ver detalhes completos em client-http.md.
Resumo: getCardById e getCardChecklists originalmente colavam
?fields=.../?checkItems=all direto na string do path, causando dois
? na URL final e falha de autenticação (401 invalid key), mesmo com
credenciais corretas. Corrigido movendo esses parâmetros para o argumento
params dos verbos de client.ts.

Funções privadas de apoio

Estas não são exportadas — são detalhe de implementação das funções
públicas acima:

FunçãoPapelgetBoardLabels(boardId)Lista todas as etiquetas de um boardresolveLabelId(boardId, labelName)Nome de etiqueta → ID, ou lança errogetBoardLists(boardId)Lista todas as listas de um boardresolveListId(boardId, listName)Nome de lista → ID, ou lança errogetCardChecklists(cardId)Lista os checklists (com itens) de um cardfindCheckItemByName(checklists, itemName)Nome de item → CheckItem, ou lança erro