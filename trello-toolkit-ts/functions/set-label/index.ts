/**
 * Cloud Function HTTP - Alterar/adicionar etiquetas
 *
 * Contrato:
 *   POST /
 *   Body: { "cardId": "...", "boardId": "...", "labelName": "..." }
 *   204 -> (No Content)
 *   400 -> { "error": "..." }  (parâmetros ausentes)
 *   404 -> { "error": "..." }  (card, board ou label não encontrado)
 *
 * Rodar localmente:
 *   npm run fn:set-card-labels
 * Testar (curl):
 *   curl -X POST http://localhost:8083 \
 *     -H "Content-Type: application/json" \
 *     -d '{"cardId": "fNyaqztT", "boardId": "6689d5483320937373975f9f", "labelName": "PENDÊNCIAS"}'
 */

import * as ff from "@google-cloud/functions-framework";
import { setCardLabelsByName } from "../../src/tools.js";
import { TrelloApiError } from "../../src/client.js";

ff.http("setCardLabels", async (req: ff.Request, res: ff.Response) => {
  const { cardId, boardId, labelName } = req.body;

  if (!cardId || !boardId || !labelName) {
    res.status(400).send({ error: "Os campos 'cardId', 'boardId' e 'labelName' são obrigatórios." });
    return;
  }

  try {
    await setCardLabelsByName(cardId, boardId, labelName);
    res.status(204).send();
  } catch (error) {
    const statusCode = error instanceof TrelloApiError ? error.status : 500;
    res.status(statusCode).send({ error: (error as Error).message });
  }
});