/**
 * Modelagem dos dados do Trello que o kit consome.
 */

/** Identificador do Trello: ObjectId de 24 caracteres ou shortLink (ex: card, board, list). */
export type TrelloId = string;

/** Versão resumida de um Card, como aparece aninhada dentro de uma Action. */
interface CardRef {
    id: TrelloId;
    name: string;
    idShort: number;
    shortLink: string;
}

/** Versão resumida de um Board, como aparece aninhada dentro de uma Action. */
interface BoardRef {
    id: TrelloId;
    name: string;
    shortLink: string;
}

/** Versão resumida de uma List, como aparece aninhada dentro de uma Action. */
interface ListRef { 
    id: TrelloId;
    name: string;
}

/**
 * Resposta da API ao postar (ou listar) um comentário em um card.
 *
 * Retornada por `POST /1/cards/{id}/actions/comments` e também aparece
 * dentro da lista devolvida por `GET /1/cards/{id}/actions`.
 *
 * @see https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-id-actions-comments-post
 */
export interface CommentAction {
    id: TrelloId;
    idMemberCreator: TrelloId;
    type: "commentCard";
    date: string;
    data: {
        text: string;
        card: CardRef;
        board: BoardRef;
        list: ListRef;
    };
}

export interface Card {
    id: TrelloId;
    name: string;
    desc: string;
    url: string;
    shortUrl: string;
    idBoard: TrelloId;
    idList: TrelloId;
    idLabels: TrelloId[];
    idChecklists: TrelloId[];
    closed: boolean;
}

/**
 * Cores válidas de etiqueta no Trello. É um conjunto fechado — não dá pra
 * inventar uma cor nova, então modelamos como union de literais em vez de
 * `string`. Isso faz o editor sugerir as opções e pega erro de digitação
 * em tempo de compilação.
 */
export type LabelColor =
  | "green"
  | "yellow"
  | "orange"
  | "red"
  | "purple"
  | "blue"
  | "sky"
  | "lime"
  | "pink"
  | "black";

/**
 * Uma etiqueta (Label) de um board do Trello.
 *
 * @see https://developer.atlassian.com/cloud/trello/rest/api-group-labels/
 */
export interface Label {
  id: TrelloId;
  idBoard: TrelloId;
  name: string;
  color: LabelColor | null;
}

/**
 * Uma lista (coluna) de um board do Trello — ex: "A FAZER", "MINUTA ELABORADA".
 *
 * @see https://developer.atlassian.com/cloud/trello/rest/api-group-lists/
 */
export interface TrelloList {
    id: TrelloId;
    name: string;
    closed: boolean;
    idBoard: TrelloId;
    pos: number;
}

/** Estado de um item de checklist — só existem esses dois valores possíveis. */
export type CheckItemState = "complete" | "incomplete";

/**
 * Um item dentro de um checklist (ex: "Etapa 2").
 *
 * @see https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-id-checkitem-idcheckitem-put
 */
export interface CheckItem {
  id: TrelloId;
  idChecklist: TrelloId;
  name: string;
  state: CheckItemState;
  pos: number;
}

/**
 * Um checklist de um card, com seus itens.
 *
 * @see https://developer.atlassian.com/cloud/trello/rest/api-group-checklists/
 */
export interface Checklist {
  id: TrelloId;
  name: string;
  idBoard: TrelloId;
  idCard: TrelloId;
  pos: number;
  checkItems: CheckItem[];
}