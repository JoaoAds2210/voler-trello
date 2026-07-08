/**
 * Cloud Function HTTP - Marcar item de checklist
 *
 * Contrato:
 *   POST /
 *   Body: { "cardId": "...", "itemName": "...", "state": "complete" | "incomplete" }
 *   204 -> (No Content)
 *   400 -> { "error": "..." }  (parâmetros ausentes ou inválidos)
 *   404 -> { "error": "..." }  (card ou item não encontrado)
 *
 * Rodar localmente:
 *   npm run fn:set-checklist-item-state
 * Testar (curl):
 *   curl -X POST http://localhost:8085 \
 *     -H "Content-Type: application/json" \
 *     -d '{"cardId": "fNyaqztT", "itemName": "etapa 2", "state": "complete"}'
 */

import * as ff from "@google-cloud/functions-framework";
import { setChecklistItemState } from "../../src/tools.js";
import { TrelloApiError } from "../../src/client.js";
import type { CheckItemState } from "../../src/types.js";

function isValidState(value: unknown): value is CheckItemState {
  return value === "complete" || value === "incomplete";
}

ff.http("setChecklistItemState", async (req: ff.Request, res: ff.Response) => {
  const { cardId, itemName, state } = req.body;

  if (!cardId || !itemName || !isValidState(state)) {
    res.status(400).send({ error: "Os campos 'cardId', 'itemName' e 'state' são obrigatórios." });
    return;
  }

  try {
    await setChecklistItemState(cardId, itemName, state);
    res.status(200).json({ success: true });
  } catch (error) {
    const statusCode = error instanceof TrelloApiError ? error.status : 500;
    res.status(statusCode).send({ error: (error as Error).message });
  }
});