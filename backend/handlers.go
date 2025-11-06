package main

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"log"
	"os"
	"sync"
)

// ---- ARMAZENAMENTO EM MEMÓRIA ----
var (
	tasks    []Task 
	nextID   = 1
	tasksMutex = &sync.Mutex{} // Semáforo para evitar conflito por concorrência
)

const dbFile = "data.json"

// ---- Handle da requisição ----
func tasksHandler(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/tasks/")

	switch r.Method {
	case "GET":
		getTasks(w, r)
	case "POST":
		createTask(w, r)
	case "PUT":
		updateTask(w, r, idStr)
	case "DELETE":
		deleteTask(w, r, idStr)
	default:
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
	}
}

// ---- Métodos ----

// ---- Busca as tasks ----
func getTasks(w http.ResponseWriter, r *http.Request) {
	tasksMutex.Lock()
	defer tasksMutex.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tasks)
}

// ---- Cria uma Task ----
func createTask(w http.ResponseWriter, r *http.Request) {
	var task Task
	
	if err := json.NewDecoder(r.Body).Decode(&task); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	if task.Titulo == "" {
		http.Error(w, "O campo 'titulo' é obrigatório", http.StatusBadRequest)
		return
	}
	
	if task.Status == "" {
		task.Status = StatusTodo
	}
	
	if task.Status != StatusTodo && task.Status != StatusInProgress && task.Status != StatusDone {
		http.Error(w, "Status inválido", http.StatusBadRequest)
		return
	}

	tasksMutex.Lock()
	defer tasksMutex.Unlock()

	task.ID = nextID
	nextID++

	tasks = append(tasks, task)
	saveTasks()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(task)
}

// ---- Altera uma task ----
func updateTask(w http.ResponseWriter, r *http.Request, idStr string) {
	id, err := strconv.Atoi(idStr)

	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	var updatedTask Task

	if err := json.NewDecoder(r.Body).Decode(&updatedTask); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	if updatedTask.Titulo == "" {
		http.Error(w, "O campo 'titulo' é obrigatório", http.StatusBadRequest)
		return
	}

	if updatedTask.Status != StatusTodo && updatedTask.Status != StatusInProgress && updatedTask.Status != StatusDone {
		http.Error(w, "Status inválido", http.StatusBadRequest)
		return
	}

	tasksMutex.Lock()
	defer tasksMutex.Unlock()

	var found bool
	for i, task := range tasks {
		if task.ID == id {
			
			tasks[i].Titulo = updatedTask.Titulo
			tasks[i].Descricao = updatedTask.Descricao
			tasks[i].Status = updatedTask.Status

			saveTasks()
			
			found = true
			
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(tasks[i])
			break
		}
	}

	if !found {
		http.Error(w, "Tarefa não encontrada", http.StatusNotFound)
	}
}

// ---- Deleta uma task ----
func deleteTask(w http.ResponseWriter, r *http.Request, idStr string) {
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	tasksMutex.Lock()
	defer tasksMutex.Unlock()

	var found bool
	for i, task := range tasks {
		if task.ID == id {
			tasks = append(tasks[:i], tasks[i+1:]...)

			saveTasks()

			found = true
			break
		}
	}

	if !found {
		http.Error(w, "Tarefa não encontrada", http.StatusNotFound)
	}

	w.WriteHeader(http.StatusNoContent)
}

// ---- Salva a task no arquivo JSON ----
func saveTasks() {
	
	data, err := json.MarshalIndent(tasks, "", "  ")
	if err != nil {
		log.Printf("Erro ao converter tarefas para JSON: %v\n", err)
		return
	}
	
	if err := os.WriteFile(dbFile, data, 0644); err != nil {
		log.Printf("Erro ao salvar tarefas no arquivo JSON: %v\n", err)
	}
}

// ---- Carrega as tasks do arquivo JSON para a lista memória ----
func LoadTasks() {
	tasksMutex.Lock()
	defer tasksMutex.Unlock()
	
	data, err := os.ReadFile(dbFile)
	
	if os.IsNotExist(err) {
		log.Println("Arquivo data.json não encontrado. Iniciando com lista vazia.")
		tasks = []Task{}
		nextID = 1
		return
	}
	
	if err != nil {
		log.Fatalf("Erro ao ler arquivo data.json: %v\n", err)
	}
	
	if err := json.Unmarshal(data, &tasks); err != nil {
		log.Fatalf("Erro ao decodificar JSON do data.json: %v\n", err)
	}
	
	if len(tasks) > 0 {
		maxID := 0
		for _, task := range tasks {
			if task.ID > maxID {
				maxID = task.ID
			}
		}
		nextID = maxID + 1
	} else {
		nextID = 1
	}
	
	log.Printf("Carregadas %d tarefas do data.json. Próximo ID: %d\n", len(tasks), nextID)
}