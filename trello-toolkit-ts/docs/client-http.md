## Visão geral
Uma vez que definimos os Tipos na seção types.ts, a função centralizada request<T> é o coração do módulo. 
Ela é oculta, garantindo o encapsulamento e reduzidno o acoplamento. A escola por ser um generics(T) é

Essa função invoca o loadTrelloAuth() para obter uma key e um token configurados, utilizando URLSearchParams do ambientes para unir as credencias de autenticação aos parametros especificos passados em cada requisição.

Ela tambem executa uma chamada assíncrona utilizando a Fetch API. Com tratamento de exceções em caso do Response.ok ser falso e já interrompendo o fluxo lançando uma instancia do TrelloApiError.

Asa funçoes com metodos HTTP formam a API pública do módulo. Todas elas herdam o comportamento genérico (<T>) da função interna request, permitindo que você especifique o formato exato que espera receber do Trello.

🔍 trelloGet<T>(path)
Utilizado exclusivamente para leitura de recursos. Não provoca efeitos colaterais no servidor do Trello.

path: Rota do endpoint (ex: "/boards/me").

Retorno: Promise<T> contendo os dados consultados.

➕ trelloPost<T>(path, params)
Cria novos recursos ou executa ações de escrita que adicionam dados ao sistema.

path: Rota do endpoint (ex: "/cards").

params: Objeto contendo os campos de criação. Nota: Conforme o padrão do Trello, estes dados são enviados via Query String, não no corpo do JSON.

Retorno: Promise<T> contendo o objeto criado.

✏️ trelloPut<T>(path, params)
Atualiza ou modifica recursos já existentes no Trello.

path: Rota do endpoint com o identificador do recurso (ex: "/cards/12345").

params: Campos parciais modificados a serem persistidos (enviados via Query String).

Retorno: Promise<T> contendo o objeto atualizado.

❌ trelloDelete<T>(path)
Remove permanentemente um recurso do Trello.

path: Rota do endpoint já mapeada com o ID a ser deletado (ex: "/cards/12345/idLabels/abcde").

Retorno: Promise<T> indicando a resposta da deleção (muitas vezes um objeto vazio {} ou status de sucesso).