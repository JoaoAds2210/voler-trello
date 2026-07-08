import {
  getCardById,
  postActionComment,
  setCardLabelsByName,
  moveCardToListByName,
  setChecklistItemState,
} from "./tools.js";

const cardId = "fNyaqztT";
const boardId = "6a4409e98bc781eba7a738c8";

console.log("1. Localizando card...");
const card = await getCardById(cardId);
console.log(card.name);

console.log("2. Postando comentário...");
await postActionComment(
  cardId,
  "Teste automatizado: minuta gerada com base no processo de teste.",
  "https://exemplo.com/minuta-teste.pdf",
);
console.log("Comentário postado.");

console.log("3. Atualizando etiqueta...");
await setCardLabelsByName(cardId, boardId, "PENDÊNCIAS");
console.log("Etiqueta atualizada.");

console.log("4. Movendo card...");
await moveCardToListByName(cardId, boardId, "MINUTA ELABORADA");
console.log("Card movido.");

console.log("5. Marcando checklist...");
await setChecklistItemState(cardId, "etapa 2", "complete");
console.log("Checklist atualizado.");

console.log("\nTodas as 5 ações executadas com sucesso!");