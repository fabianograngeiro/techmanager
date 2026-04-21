# Como rodar o TechManager localmente

Este guia mostra como preparar um novo computador para rodar o projeto localmente, incluindo clonagem do GitHub, instalacao de dependencias e execucao do servidor.

## Requisitos

- Git instalado
- Node.js (com npm) instalado

Sugestao: use a versao LTS do Node.js.

## 1) Clonar o repositorio

Abra um terminal e execute:

```bash
git clone <URL_DO_REPOSITORIO>
cd TechManager
```

Se voce ainda nao tem a URL, pegue no GitHub:

1. Abra o repositorio no GitHub.
2. Clique no botao "Code".
3. Copie a URL HTTPS ou SSH.

## 2) Instalar dependencias

Dentro da pasta do projeto:

```bash
npm install
```

Isso instala todas as dependencias do front-end e do servidor local.

## 3) Rodar o projeto em modo desenvolvimento

```bash
npm run dev
```

O projeto inicia o servidor local. A saida do terminal informara o endereco local (normalmente http://localhost:5173).

## 4) Dicas de problemas comuns

- Se der erro de dependencia, apague `node_modules` e rode `npm install` novamente.
- Se a porta estiver ocupada, feche o processo que esta usando a porta ou reinicie o terminal.
- Se o TypeScript reclamar, rode `npm run lint` para ver detalhes.

## 5) Atualizar o projeto no futuro

Para puxar novas mudancas do GitHub:

```bash
git pull
```

Depois execute novamente:

```bash
npm install
npm run dev
```

## 6) Resumo rapido (copy/paste)

```bash
# 1) clonar
 git clone <URL_DO_REPOSITORIO>
 cd TechManager

# 2) instalar dependencias
 npm install

# 3) rodar
 npm run dev
```
