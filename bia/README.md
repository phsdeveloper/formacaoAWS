## Projeto base para o evento Imersão AWS & IA que irei realizar.

### Período do evento: 19/09 e 20/09/2026 (Online e ao Vivo das 9h30 às 17h30)

[>> Página de Inscrição do evento](https://org.imersaoaws.com.br/github/readme)

#### Endereço da API ####

Ao iniciar, o frontend testa `VITE_API_URL` (definida no build do Vite) e,
se necessário, usa o mesmo endereço e porta da página. Assim, funciona com
`localhost:3001` no Docker Compose e com a porta acessada na EC2 ou no ALB.
Uma URL `localhost` configurada é ignorada quando a página é acessada por
outro host. Se nenhuma opção responder em `/api/versao`, a aplicação exibe
um erro e permite tentar novamente. Para usar o servidor de desenvolvimento
Vite separado do backend, configure `VITE_API_URL` no build/início do Vite.

#### Para rodar as migrations no container ####
```
docker compose exec server bash -c 'npx sequelize db:migrate'
```

