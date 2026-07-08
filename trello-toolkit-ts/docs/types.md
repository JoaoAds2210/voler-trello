## Visão geral
Este arquivo define o "contrato de dados" entre a API do Trello e o resto
do nosso código, usando interfaces do TypeScript. Ele não executa nada —
não faz requisição, não tem lógica — só descreve a forma que cada resposta
da API deve ter (Card, Label, TrelloList, Checklist, etc.).

Todo arquivo que fala com o Trello depende dele: client.ts usa esses
tipos como parâmetro genérico nas funções HTTP (trelloGet<Card>(...)), e
tools.ts usa como tipo de entrada/retorno das funções de negócio
(getCardById(id: string): Promise<Card>).

O ganho de centralizar isso em um único lugar: se a API do Trello mudar, ou
se descobrirmos um campo que faltou tipar, corrigimos em um só arquivo — e
o compilador avisa automaticamente todo lugar do projeto que ficou
incompatível com a mudança, em vez de precisarmos caçar isso manualmente.

A API do Trello devolve dezenas de campos em cada resposta (o card, por
exemplo, também tem badges, cover, due, votes e muitos outros que
não usamos). Tipamos só os campos que o kit realmente consome.

Isso é seguro por causa da tipagem estrutural do TypeScript: um objeto
"bate" com uma interface se tiver pelo menos os campos exigidos por ela —
campos a mais no valor real não quebram nada. Então declarar Card com 10
campos, mesmo a API devolvendo 40, é uma afirmação válida: só estamos
documentando o que nos interessa usar, não a resposta inteira.

Cada interface pública carrega um comentário JSDoc com uma tag @see
apontando para o endpoint exato da documentação oficial da Atlassian que
originou aquele formato.
