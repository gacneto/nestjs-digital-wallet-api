# Digital Wallet API

API robusta para gerenciamento de carteiras digitais e transações financeiras, desenvolvida com NestJS.

## 🛠 Tech Stack

O projeto utiliza as seguintes tecnologias e ferramentas:

- **Framework**: [NestJS](https://nestjs.com/) (Node.js)
- **Linguagem**: TypeScript
- **Banco de Dados**: MySQL 8.0
- **ORM**: TypeORM
- **Containerização**: Docker & Docker Compose
- **Documentação**: Swagger (OpenAPI)
- **Validação**: class-validator & class-transformer

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
- [npm](https://www.npmjs.com/) (geralmente vem com o Node.js)
- [Docker](https://www.docker.com/) & Docker Compose (Recomendado para rodar o ambiente completo facilmente)

## 🚀 Instalação e Configuração

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd api-digital-wallet
```

### 2. Configuração de Variáveis de Ambiente (.env)

O projeto necessita de um arquivo `.env` na raiz para definir as configurações sensíveis e de conexão. Um arquivo de exemplo `.env.example` é fornecido.

Crie o arquivo `.env` copiando o exemplo:

```bash
cp .env.example .env
```

**Variáveis Importantes:**

| Variável      | Descrição               | Valor Padrão (Exemplo)               |
| ------------- | ----------------------- | ------------------------------------ |
| `DB_HOST`     | Host do banco de dados  | `localhost` (local) ou `db` (docker) |
| `DB_PORT`     | Porta do banco de dados | `3306`                               |
| `DB_USERNAME` | Usuário do banco        | `wallet_api_homolog`                 |
| `DB_PASSWORD` | Senha do banco          | `api123`                             |
| `DB_DATABASE` | Nome do banco           | `wallet_homolog`                     |
| `PORT`        | Porta da API            | `3000`                               |
| `TAXA_...`    | Taxas de transação      | (Verificar no .env)                  |

> **Nota:** Se você for rodar via **Docker**, o `DB_HOST` deve ser `db`. Se for rodar **localmente** (npm run start), deve ser `localhost`.

---

## 🏃‍♂️ Como Rodar o Projeto

### Opção A: Usando Docker (Recomendada)

Esta é a forma mais simples, pois sobe o banco de dados (MySQL), a API e o phpMyAdmin automaticamente.

1. Certifique-se que o Docker está rodando.
2. Execute o comando:

```bash
docker-compose up --build
```

- A API estará disponível em: `http://localhost:3000`
- O Swagger (Documentação) em: `http://localhost:3000/docs`
- O phpMyAdmin (Gerenciador de DB) em: `http://localhost:8080`

### Opção B: Rodando Localmente (Sem Docker para a API)

Se preferir rodar a API diretamente no seu Node.js local:

1. **Suba o Banco de Dados**: Você ainda precisará de um banco MySQL. Você pode usar o Docker apenas para o banco:
   ```bash
   docker-compose up -d db phpmyadmin
   ```
2. **Instale as dependências**:
   ```bash
   npm install
   ```
3. **Inicie a aplicação**:

   ```bash
   # Desenvolvimento
   npm run start:dev

   # Produção
   npm run start:prod
   ```

---

## 📚 Documentação da API (Swagger)

A documentação interativa dos endpoints está disponível através do Swagger UI.
Após iniciar a aplicação, acesse:

👉 **[http://localhost:3000/docs](http://localhost:3000/docs)**

---

## ⚠️ Troubleshooting (Problemas Comuns)

### 1. Erro: `Port 3306 is already in use`

Isso significa que você já tem um MySQL rodando na sua máquina (talvez instalado nativamente ou outro container).
**Solução:**

- Pare o serviço MySQL local (`sudo service mysql stop` ou equivalente).
- OU altere a porta externa no `docker-compose.yml` (ex: `'3307:3306'`) e atualize o `DB_PORT` no `.env`.

### 2. Erro: `Port 3000 is already in use`

Outra aplicação está usando a porta 3000.
**Solução:**

- Identifique e pare o processo que está usando a porta.
- OU mude a `PORT` no arquivo `.env` para outro valor (ex: 3001).

### 3. Erro de Conexão com o Banco (ECONNREFUSED)

- Verifique se o container do banco (`wallet_db`) está rodando (`docker ps`).
- Verifique se as credenciais no `.env` batem com as do `docker-compose.yml`.
- Se rodando localmente, garanta que `DB_HOST=localhost`. Se via Docker, `DB_HOST=db`.

### 4. Permissões de Arquivo (Linux/Mac)

Se tiver problemas com scripts, tente dar permissão de execução:

```bash
chmod +x node_modules/.bin/nest
```
