/**
 * Cloud Function HTTP - Mover card entre listas
 *
 * Contrato:
 *   POST /
 *   Body: { "cardId": "...", "boardId": "...", "listName": "..." }
 *   204 -> (No Content)
 *   400 -> { "error": "..." }  (parâmetros ausentes)
 *   404 -> { "error": "..." }  (card, board ou lista não encontrada)
 *
 * Rodar localmente:
 *   npm run fn:move-card-to-list
 * Testar (curl):
 *   curl -X POST http://localhost:8084 \
 *     -H "Content-Type: application/json" \
 *     -d '{"cardId": "fNyaqztT", "boardId": "6689d5483320937373975f9f", "listName": "MINUTA ELABORADA"}'
 */

import * as ff from "@google-cloud/functions-framework";
import { moveCardToListByName } from "../../src/tools.js";
import { TrelloApiError } from "../../src/client.js";

ff.http("moveCardToList", async (req: ff.Request, res: ff.Response) => {
  const { cardId, boardId, listName } = req.body;

  if (!cardId || !boardId || !listName) {
    res.status(400).send({ error: "Os campos 'cardId', 'boardId' e 'listName' são obrigatórios." });
    return;
  }

  try {
    await moveCardToListByName(cardId, boardId, listName);
    res.status(200).json({ success: true });
  } catch (error) {
    const statusCode = error instanceof TrelloApiError ? error.status : 500;
    res.status(statusCode).send({ error: (error as Error).message });
  }
});