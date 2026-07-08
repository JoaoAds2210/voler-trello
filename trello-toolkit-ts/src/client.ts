import { loadTrelloAuth } from './config.js';


/**
 * Erro lançado quando a API do Trello responde com status fora da faixa 2xx.
 * Permite diferenciar erros do Trello de outros erros do programa via
 * `instanceof TrelloApiError`, e carrega o status HTTP original para quem
 * for tratar o erro decidir o que fazer (ex: 404 = não encontrado, 429 = rate limit).
 */
export class TrelloApiError extends Error {
    constructor(message: string, public readonly status: number){
        super(message);
        this.name = "TrelloApiError";
    };
}

//endereço raiz do servidor onde a API REST do Trello está hospedada.
const BASE_URL = "https://api.trello.com/1";

/**
 * Executa uma requisição autenticada contra a API do Trello.
 * Função interna — os verbos públicos (trelloGet, trelloPost, etc.) chamam
 * esta por baixo dos panos; nada fora deste arquivo deveria usá-la direto.
 *
 * @param method - Verbo HTTP da requisição.
 * @param path - Caminho do endpoint, sem a base (ex: "/cards/abc123").
 * @param params - Parâmetros extras da query string (além de key/token, que
 *   são sempre anexados automaticamente).
 * @throws {TrelloApiError} Se a resposta não estiver na faixa 2xx.
 */


//Como eu criei um types.ts em forma de interface, a função retornará um T(Generics) que é a forma que ele pode assumir
//assim a mesma função HTTP serve para qualquer tipo, só passar o tipo certo que já deu certo.
async function request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    params: Record<string, string> = {},
    ): Promise<T> {

    const auth = loadTrelloAuth();
    const query = new URLSearchParams({ key: auth.key, token: auth.token, ...params });
    const url = `${BASE_URL}${path}?${query.toString()}`;

    const fetchOptions: RequestInit = { method };
    
    if ((method === "POST" || method === "PUT") && Object.keys(params).length > 0) {
        fetchOptions.headers = { "Content-Type": "application/json" };
        fetchOptions.body = JSON.stringify(params);
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
        // Tenta ler a mensagem de erro que o Trello manda no body
        const errorText = await response.text().catch(() => "Erro desconhecido");
        throw new TrelloApiError(
            `Erro ${response.status} em ${method} ${path}: ${errorText}`,
            response.status,
        );
    }

    return (await response.json()) as T;
}


/**
 * Busca um recurso no Trello (leitura, sem efeitos colaterais).
 *
 * @param path - Caminho do endpoint (ex: "/cards/abc123").
 * @typeParam T - Formato esperado da resposta (ex: Card, Label[]).
 */
export async function trelloGet<T>(path: string, params: Record<string, string> = {},): Promise<T> {
  return request<T>("GET", path, params);
}


/**
 * Cria ou modifica um recurso no Trello via POST
 * (ex: adicionar etiqueta, postar comentário).
 *
 * @param path - Caminho do endpoint (ex: "/cards/abc123/actions/comments").
 * @param params - Corpo da requisição, enviado como query string
 *   (padrão da API do Trello — não é JSON no body).
 * @typeParam T - Formato esperado da resposta.
 */
export async function trelloPost<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    return request<T>("POST", path, params);   
}


/**
 * Atualiza um recurso existente no Trello via PUT
 * (ex: mover card de lista, marcar item de checklist).
 *
 * @param path - Caminho do endpoint (ex: "/cards/abc123").
 * @param params - Campos a atualizar, enviados como query string.
 * @typeParam T - Formato esperado da resposta.
 */
export async function trelloPut<T>(path:string, params: Record<string, string> = {}): Promise<T> {
    return request<T>("PUT", path, params);
}


/**
 * Remove um recurso do Trello via DELETE (ex: remover etiqueta de um card).
 *
 * @param path - Caminho do endpoint, já contendo o identificador do recurso
 *   a remover (ex: "/cards/abc123/idLabels/xyz789").
 * @typeParam T - Formato esperado da resposta.
 */
export async function trelloDelete<T>(path: string): Promise<T> {
    return request<T>("DELETE", path);
}

