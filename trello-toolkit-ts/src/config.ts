export interface TrelloAuth {
    key: string;
    token: string;
}

export function loadTrelloAuth(): TrelloAuth {
    
  const apiKey = process.env.TRELLO_API_KEY;
  const token = process.env.TRELLO_TOKEN;

  if (!apiKey || !token) {
    throw new Error(
      "Credenciais ausentes. Defina as variáveis de ambiente TRELLO_API_KEY e TRELLO_TOKEN."
    );
  }

  return { key: apiKey, token };
}