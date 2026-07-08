# Contratos das Cloud Functions

Este arquivo documenta o contrato de entrada (request body) para cada uma das Cloud Functions HTTP do projeto, detalhando os campos JSON obrigatórios.

---

### 1. `getCard`

-   **Endpoint:** `get-card`
-   **Descrição:** Localiza e retorna os dados de um card do Trello.
-   **Corpo da Requisição (JSON):**
    ```json
    {
      "cardId": "string"
    }
    ```

---

### 2. `postComment`

-   **Endpoint:** `post-comment`
-   **Descrição:** Posta um comentário em um card, contendo um resumo e um link para um PDF.
-   **Corpo da Requisição (JSON):**
    ```json
    {
      "cardId": "string",
      "summary": "string",
      "pdfUrl": "string"
    }
    ```

---

### 3. `setCardLabels`

-   **Endpoint:** `set-card-labels`
-   **Descrição:** Define (substitui) a etiqueta de um card.
-   **Corpo da Requisição (JSON):**
    ```json
    {
      "cardId": "string",
      "boardId": "string",
      "labelName": "string"
    }
    ```

---

### 4. `moveCardToList`

-   **Endpoint:** `move-card-to-list`
-   **Descrição:** Move um card para uma lista (coluna) específica do board.
-   **Corpo da Requisição (JSON):**
    ```json
    {
      "cardId": "string",
      "boardId": "string",
      "listName": "string"
    }
    ```

---

### 5. `setChecklistItemState`

-   **Endpoint:** `set-checklist-item-state`
-   **Descrição:** Marca um item de um checklist como completo ou incompleto.
-   **Corpo da Requisição (JSON):**
    ```json
    {
      "cardId": "string",
      "itemName": "string",
      "state": "complete" | "incomplete"
    }
    ```
