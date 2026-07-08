/**
 * Cloud Function HTTP - Postar comentário
 *
 * Contrato:
 *   POST /
 *   Body: { "cardId": "...", "summary": "...", "pdfUrl": "..." }
 *   200 -> CommentAction (ver src/types.ts)
 *   400 -> { "error": "..." }  (parâmetros ausentes)
 *   404 -> { "error": "..." }  (card não encontrado)
 *
 * Rodar localmente:
 *   npm run fn:post-comment
 * Testar (curl):
 *   curl -X POST http://localhost:8082 \
 *     -H "Content-Type: application/json" \
 *     -d '{"cardId": "fNyaqztT", "summary": "Teste de comentário via CF", "pdfUrl": "https://example.com/doc.pdf"}'
 */

import * as ff from "@google-cloud/functions-framework";
import { postActionComment } from "../../src/tools.js";
import { TrelloApiError } from "../../src/client.js";

ff.http("postComment", async (req: ff.Request, res: ff.Response) => {
  const { cardId, summary, pdfUrl } = req.body;

  if (!cardId || !summary || !pdfUrl) {
    res.status(400).send({ error: "Os campos 'cardId', 'summary' e 'pdfUrl' são obrigatórios." });
    return;
  }

  try {
    const comment = await postActionComment(cardId, summary, pdfUrl);
    res.status(200).send(comment);
  } catch (error) {
    const statusCode = error instanceof TrelloApiError ? error.status : 500;
    res.status(statusCode).send({ error: (error as Error).message });
  }
});