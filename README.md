Desafio Fullstack Veritas - Mini Kanban (React + Go)
Este projeto é uma solução para o Desafio Técnico Fullstack proposto pela Veritas Consultoria Empresarial , 
com o objetivo de criar um "Mini Kanban de Tarefas".


A aplicação consiste em um frontend em React e um backend em Go, permitindo ao usuário gerenciar tarefas 
através de três colunas fixas: "A Fazer", "Em Progresso" e "Concluídas".

---- Funcionalidades ----

-- Backend (Go) --

API RESTful com endpoints GET, POST, PUT e DELETE para /tasks.

Armazenamento de dados em memória e em arquivo JSON.

Validações básicas (título obrigatório, status válido).

-- Frontend (React) --

Renderização das três colunas.

Adicionar novas tarefas.

Editar, mover entre colunas e excluir tarefas.

Feedbacks visuais de loading e erro.

Persistência de dados via API Go.

---- Instruções para Execução ----
Para rodar este projeto, você precisará de dois terminais abertos simultaneamente: um para o backend e outro para o frontend.

1. Backend (Servidor Go)
Abra um terminal e digite:
cd backend

Rode o servidor:
go run .

O servidor estará em execução na porta http://localhost:8080.

2. Frontend (Aplicação React)
Abra um novo terminal e digite:
cd frontend

Instale as dependências:
npm install

Rode o frontend:
npm run dev

A aplicação estará disponível no seu navegador em http://localhost:5173.

---- Decisões Técnicas ----
-- Backend -- 

Foi utilizada apenas a biblioteca padrão net/http do Go para a criação do servidor e dos handlers, pois foi a forma mais simples que encontrei
para atender os requisitos do desafio.

Para o armazenamento em memória, foi utilizado uma lista global para as tarefas e um sync.Mutex (Semáforo) para garantir a segurança no acesso concorrente e evitar conflitos.

-- Frontend --

O projeto foi criado com o Vite por conta do hot-reloading que facilita e acelera o desenvolvimento dos componentes.

A gestão de estado foi feita inteiramente com os hooks nativos do React (useState, useEffect).

A comunicação com a API foi feita com a fetch API nativa do navegador, utilizando async/await.