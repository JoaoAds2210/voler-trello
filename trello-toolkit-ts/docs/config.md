## Visão geral
Esse arquivo é onde as credenciais moram. O process.env é um objeto do Node que guarda as variáveis de ambiente definidas no ambiente onde o projeto for rodado.

Se a variável estiver definida, o TypeScript considera o valor como string; caso contrário, undefined. Por isso, loadTrelloAuth valida isso explicitamente: se apiKey/token não existirem, o programa lança um erro imediatamente, na hora de carregar as credenciais — em vez de deixar o problema aparecer mais tarde, de forma confusa, quando uma requisição HTTP falhasse por falta de autenticação. 

Passada essa validação, a função devolve um objeto TrelloAuth com key e token garantidamente como string.