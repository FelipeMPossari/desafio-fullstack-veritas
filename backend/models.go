package main

// Constantes para os status
const (
	StatusTodo       = "A Fazer"
	StatusInProgress = "Em Progresso"
	StatusDone       = "Concluídas"
)

// Estrutura de dados de uma tarefa no Kanban.
type Task struct {
	ID        int    `json:"id"`
	Titulo    string `json:"titulo"`
	Descricao string `json:"descricao,omitempty"`
	Status    string `json:"status"`    