import { trelloGet, trelloPost, trelloDelete, trelloPut } from "./client.js";
import type { Card, CommentAction, Label, TrelloList, Checklist, CheckItem, CheckItemState } from "./types.js";


/**
 * Localiza um card pelo ID (ou shortLink) e retorna seus dados essenciais —
 * lista atual, board, etiquetas e checklists — para o agente decidir a
 * próxima ação.
 *
 * @param cardId - ID (24 caracteres hex) ou shortLink do card. Ex: "abc123" ou "3CsPkqOF".
 * @returns O card, já tipado conforme a interface {@link Card}.
 * @see https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-id-get
 */
export async function getCardById(cardId: string): Promise<Card> {
    
    const fields = "id,name,desc,url,shortUrl,idBoard,idList,idLabels,idChecklists,closed";
    return trelloGet<Card>(`/cards/${cardId}`, { fields });
}

/**
 * Posta um comentário no card resumindo a ação realizada pelo agente,
 * incluindo o link do PDF gerado.
 *
 * @param cardId - ID do card onde o comentário será postado.
 * @param summary - Resumo em texto livre da ação executada. Ex: "Minuta de
 *   resposta gerada com base no processo X."
 * @param pdfUrl - URL pública do PDF gerado.
 * @returns A action de comentário criada, tipada conforme {@link CommentAction}.
 * @see https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-id-actions-comments-post
 */
export async function postActionComment(cardId: string, summary: string, pdfUrl: string): Promise<CommentAction> {
    
    const text = `${summary}\nPDF: ${pdfUrl}`;
    return trelloPost<CommentAction>(`/cards/${cardId}/actions/comments`, { text });
}

/**
 * Lista as etiquetas disponíveis em um board, para resolver nome → id.
 *
 * @param boardId - ID do board.
 * @see https://developer.atlassian.com/cloud/trello/rest/api-group-labels/
 */
export async function getBoardLabels(boardId: string): Promise<Label[]> {
    
    return trelloGet<Label[]>(`/boards/${boardId}/labels`);
}

async function resolveLabelId(boardId: string, labelName: string): Promise<string> {
  
    const labels = await getBoardLabels(boardId);
    const found = labels.find((label) => label.name === labelName);

  if (!found) {
    throw new Error(`Etiqueta "${labelName}" não encontrada no board ${boardId}.`);
  }

  return found.id;
}


/**
 * Define a etiqueta de um card a partir de um nome amigável (ex:
 * "Aguardando Resposta", "Pendências"), resolvendo o nome para o ID
 * interno da etiqueta no board.
 *
 * @param cardId - ID do card a etiquetar.
 * @param boardId - ID do board onde o card está (para localizar a etiqueta pelo nome).
 * @param labelName - Nome exato da etiqueta desejada. Ex: "Aguardando Resposta".
 * @see https://developer.atlassian.com/cloud/trello/rest/api-group-labels/
 */
export async function setCardLabelsByName(cardId: string, boardId: string, labelName: string): Promise<void> {
  
    const labelId = await resolveLabelId(boardId, labelName);

  const card = await getCardById(cardId);
  const oldLabelIds = card.idLabels.filter((id) => id !== labelId);

  for (const oldId of oldLabelIds) {
    await trelloDelete(`/cards/${cardId}/idLabels/${oldId}`);
  }

  await trelloPost(`/cards/${cardId}/idLabels`, { value: labelId });
}

//busca todas as listas de um board e devolve um array de Listas
async function getBoardLists(boardId: string): Promise<TrelloList[]> {
  return trelloGet<TrelloList[]>(`/boards/${boardId}/lists`);
}

//pega essa lista inteira e procura pelo nome. Achando retorna o ID
async function resolveListId(boardId: string, listName: string): Promise<string> {
  const lists = await getBoardLists(boardId);
  const found = lists.find((list) => list.name === listName);

  if (!found) {
    throw new Error(`Lista "${listName}" não encontrada no board ${boardId}.`);
  }

  return found.id;
}


/**
 * Move um card para outra lista do mesmo board, a partir do nome da lista
 * de destino (ex: "MINUTA ELABORADA").
 *
 * @param cardId - ID do card a mover.
 * @param boardId - ID do board onde a lista está.
 * @param listName - Nome exato da lista de destino.
 * @see https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-id-put
 */
export async function moveCardToListByName(cardId: string, boardId: string, listName: string): Promise<void> {
  const listId = await resolveListId(boardId, listName);
  await trelloPut(`/cards/${cardId}`, { idList: listId });
}

export async function getCardChecklists(cardId: string): Promise<Checklist[]> {
  return trelloGet<Checklist[]>(`/cards/${cardId}/checklists`, { checkItems: "all" });
}

function findCheckItemByName(checklists: Checklist[], itemName: string): CheckItem {
  for (const checklist of checklists) {
    const found = checklist.checkItems.find((item) => item.name === itemName);
    if (found) {
      return found;
    }
  }
  throw new Error(`Item de checklist "${itemName}" não encontrado no card.`);
}

/**
 * Marca ou desmarca um item de checklist pelo nome (ex: marcar "Etapa 2"
 * como concluída, avançando o fluxo para "Etapa 3").
 *
 * @param cardId - ID do card que contém o checklist.
 * @param itemName - Nome exato do item a alterar. Ex: "Etapa 2".
 * @param state - Novo estado do item: "complete" ou "incomplete".
 * @see https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-id-checkitem-idcheckitem-put
 */
export async function setChecklistItemState(
  cardId: string,
  itemName: string,
  state: CheckItemState,
): Promise<void> {
  const checklists = await getCardChecklists(cardId);
  const item = findCheckItemByName(checklists, itemName);

  await trelloPut(`/cards/${cardId}/checkItem/${item.id}`, { state });
}

