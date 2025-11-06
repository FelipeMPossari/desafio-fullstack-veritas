package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	LoadTasks()

	mux := http.NewServeMux()

	// ---- DEFINIÇÃO DAS ROTAS ----
	mux.HandleFunc("/tasks", tasksHandler)
	mux.HandleFunc("/tasks/", tasksHandler)

	// ---- MIDDLEWARE DE CORS ----
	handler := corsMiddleware(mux)

	// ---- INICIANDO O SERVIDOR ----
	fmt.Println("Backend Go rodando na porta :8080")
	fmt.Println("Acesse http://localhost:8080")

	log.Fatal(http.ListenAndServe(":8080", handler))
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		//Busca o handler
		next.ServeHTTP(w, r)
	})
}