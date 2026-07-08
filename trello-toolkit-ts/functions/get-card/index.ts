/**
 * Cloud Function HTTP - Obter dados de um card
 *
 * Contrato:
 *   GET ?cardId=...
 *   200 -> { ...dados do card... }
 *   400 -> { "error": "..." }  (parâmetros ausentes ou inválidos)
 *   404 -> { "error": "..." }  (card não encontrado)
 *
 * Rodar localmente:
 *   npm run fn:get-card
 * Testar (curl):
 *   curl http://localhost:8085?cardId=fNyaqztT
 */

import * as ff from "@google-cloud/functions-framework";
import { getCardById } from "../../src/tools.js";
import { TrelloApiError } from "../../src/client.js";

ff.http("getCardById", async (req: ff.Request, res: ff.Response) => {
  const { cardId } = req.query;

  if (!cardId || typeof cardId !== "string") {
    res.status(400).send({ error: "O parâmetro 'cardId' é obrigatório." });
    return;
  }

  try {
    const card = await getCardById(cardId);
    res.status(200).send(card);
  } catch (error) {
    const statusCode = error instanceof TrelloApiError ? error.status : 500;
    res.status(statusCode).send({ error: (error as Error).message });
  }
});