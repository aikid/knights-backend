# Knights Backend

Seja bem vindo jovem cavaleiro!
Knights Backend é uma API desenvolvida com [NestJS](https://nestjs.com/) e [Prisma](https://www.prisma.io/) que serve como um sistema de gerenciamento de cavaleiros. Utilizando o banco de dados MongoDB, esta aplicação fornece um conjunto de endpoints para criar, listar e gerenciar cavaleiros e suas informações, além poder também promover um cavaleiro. A documentação da API é fornecida pelo Swagger.

## Sumário

- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Execução](#execução)
- [Testes](#testes)
- [Documentação da API](#documentação-da-api)
- [Contribuição](#contribuição)
- [Suporte](#suporte)

## Tecnologias
  - **Node**
  - **NestJS**
  - **Prisma**
  - **MongoDB**
  - **Swagger**
  - **Vitest**

## Instalação

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/aikid/knights-backend.git
   cd knights-backend
   ```

2. **Instale as dependências:**

   Certifique-se de ter o [Node.js](https://nodejs.org/) e o [npm](https://www.npmjs.com/) instalados. Em seguida, execute:

   ```bash
   npm install
   ```

## Configuração

1. **Variáveis de ambiente:**

   Crie um arquivo `.env` na raiz do projeto e adicione as seguintes variáveis de ambiente:

   ```env
   DATABASE_URL="mongodb+srv://knights:knights2025BTG@cluster0.x6lnxin.mongodb.net/kingdom?retryWrites=true&w=majority"
   PORT=3333
   ```

   Substitua o valor de `DATABASE_URL` pela URL de conexão do seu banco de dados MongoDB.

2. **Configuração do Prisma:**

   Após configurar as variáveis de ambiente, gere o cliente Prisma:

   ```bash
   npx prisma generate
   ```

## Execução

- **Ambiente de Desenvolvimento:**

  Para iniciar a aplicação em modo de desenvolvimento:

  ```bash
  npm run start:dev
  ```

  A API estará disponível em:
  `http://localhost:3333`.

## Testes

Para executar os testes, utilize:

```bash
npm run test
```

Para testes de integração:

```bash
npm run test:e2e
```

Para verificar a cobertura dos testes:

```bash
npm run test:cov
```
Os testes E2E são executados em um banco separado, já configurado no arquivo setup-e2e.ts dentro da pasta **src/test**

## Documentação da API

A documentação da API, gerada pelo Swagger, estará disponível em:

```bash
http://localhost:3333/api
```

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## Suporte

  - Autor: Leandro Brito do Nascimento Nogueira
  - Linkedin: [https://www.linkedin.com/in/leandro-brito-do-nascimento-5b9319105/](https://www.linkedin.com/in/leandro-brito-do-nascimento-5b9319105/)
  - Github: [https://github.com/aikid](https://github.com/aikid/) 
