import { useState, useEffect } from 'react';
import './app.css';

const COLUNAS = ['A Fazer', 'Em Progresso', 'Concluídas'];
const API_URL = 'http://localhost:8080/tasks';

function App() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    // Busca todas as tarefas da API
    const fetchTasks = async () => {
        setLoading(true);

        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Falha na rede: ${response.statusText}`);
            }
            const data = await response.json();
            setTasks(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Adiciona uma nova tarefa
    const handleAddTask = async (titulo, descricao) => {
        const novaTarefa = {
            titulo: titulo,
            descricao: descricao,
            status: 'A Fazer',
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(novaTarefa),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Falha ao criar tarefa: ${errorText}`);
            }

            const tarefaCriada = await response.json();
            setTasks(tarefasAnteriores => [...tarefasAnteriores, tarefaCriada]);
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    // Atualiza o status de uma tarefa
    const handleUpdateTaskStatus = async (taskId, novoStatus) => {
        const taskOriginal = tasks.find(task => task.id === taskId);
        if (!taskOriginal) return;

        const tarefaAtualizada = {
            id: taskOriginal.id,
            titulo: taskOriginal.titulo,
            descricao: taskOriginal.descricao,
            status: novoStatus,
        };

        try {
            const response = await fetch(`${API_URL}/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tarefaAtualizada),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Falha ao mover tarefa: ${errorText}`);
            }

            const tarefaRetornada = await response.json();
            setTasks(tarefasAnteriores =>
                tarefasAnteriores.map(task =>
                    task.id === taskId ? tarefaRetornada : task
                )
            );
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    // Deleta uma tarefa
    const handleDeleteTask = async (taskId) => {
        if (!window.confirm("Tem certeza que deseja excluir esta tarefa?")) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${taskId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Falha ao excluir tarefa: ${errorText}`);
            }

            setTasks(tarefasAnteriores =>
                tarefasAnteriores.filter(task => task.id !== taskId)
            );
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    // Altera uma tarefa
    const handleEditContent = async (taskId, novoTitulo, novaDescricao) => {
        const taskOriginal = tasks.find(task => task.id === taskId);
        if (!taskOriginal) return;

        const tarefaAtualizada = {
            id: taskOriginal.id,
            titulo: novoTitulo,
            descricao: novaDescricao,
            status: taskOriginal.status,
        };

        try {
            const response = await fetch(`${API_URL}/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tarefaAtualizada),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Falha ao editar tarefa: ${errorText}`);
            }

            const tarefaRetornada = await response.json();
            setTasks(tarefasAnteriores =>
                tarefasAnteriores.map(task =>
                    task.id === taskId ? tarefaRetornada : task
                )
            );
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return <div className="app-container"><h1>Carregando...</h1></div>;
    }

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>Kanban</h1>
            </header>

            {error && (
                <ErrorModal
                    message={error}
                    onClose={() => setError(null)}
                />
            )}

            <div className="kanban-board">
                {COLUNAS.map(coluna => (
                    <KanbanColumn
                        key={coluna}
                        titulo={coluna}
                        tasks={tasks.filter(task => task.status === coluna)}
                        onUpdateTaskStatus={handleUpdateTaskStatus}
                        onDeleteTask={handleDeleteTask}
                        onEditContent={handleEditContent}
                        setError={setError}
                    />
                ))}
            </div>

            <AddTaskForm
                onSubmit={handleAddTask}
                setError={setError}
            />
        </div>
    );
}

// Componente para o Modal de Erro
function ErrorModal({ message, onClose }) {
    return (
        <div className="error-modal">
            <span className="error-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                </svg>
            </span>
            <p>{message}</p>
            <button className="error-close-btn" onClick={onClose}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                </svg>
            </button>
        </div>
    );
}

// Componente que renderiza uma coluna
function KanbanColumn({ titulo, tasks, onUpdateTaskStatus, onDeleteTask, onEditContent, setError }) {
    return (
        <div className="kanban-column">
            <h2>{titulo}</h2>
            {tasks.length === 0 ? (
                <p>Nenhuma tarefa aqui.</p>
            ) : (
                tasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onUpdateTaskStatus={onUpdateTaskStatus}
                        onDeleteTask={onDeleteTask}
                        onEditContent={onEditContent}
                        setError={setError}
                    />
                ))
            )}
        </div>
    );
}

// Componente que renderiza um cartão de tarefa
function TaskCard({ task, onUpdateTaskStatus, onDeleteTask, onEditContent, setError }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitulo, setEditTitulo] = useState(task.titulo);
    const [editDescricao, setEditDescricao] = useState(task.descricao);

    const proximoStatus = task.status === 'A Fazer' ? 'Em Progresso' : 'Concluídas';
    const podeMover = task.status !== 'Concluídas';

    const statusAnterior = task.status === 'Em Progresso' ? 'A Fazer' : 'Em Progresso';
    const podeVoltar = task.status !== 'A Fazer';

    // Salva o conteúdo editado
    const handleSave = () => {
        if (!editTitulo) {
            setError('O título é obrigatório!');
            return;
        }
        onEditContent(task.id, editTitulo, editDescricao);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditTitulo(task.titulo);
        setEditDescricao(task.descricao);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="task-card">
                <input
                    type="text"
                    value={editTitulo}
                    onChange={(e) => setEditTitulo(e.target.value)}
                    style={{ width: '95%', marginBottom: '5px' }}
                />
                <textarea
                    value={editDescricao}
                    onChange={(e) => setEditDescricao(e.target.value)}
                    style={{ width: '95%', minHeight: '50px' }}
                />
                <button onClick={handleSave}>Salvar</button>
                <button onClick={handleCancel}>Cancelar</button>
            </div>
        );
    }

    return (
        <div className="task-card">
            <h3>{task.titulo}</h3>
            {task.descricao && <p>{task.descricao}</p>}

            <button onClick={() => setIsEditing(true)}>Editar</button>
            <button onClick={() => onDeleteTask(task.id)}>Excluir</button>

            <div style={{ marginTop: '10px' }}>
                {podeVoltar && (
                    <button onClick={() => onUpdateTaskStatus(task.id, statusAnterior)}>
                        &larr; Voltar
                    </button>
                )}
                {podeMover && (
                    <button onClick={() => onUpdateTaskStatus(task.id, proximoStatus)}>
                        Mover &rarr;
                    </button>
                )}
            </div>
        </div>
    );
}

// Componente do formulário para adicionar novas tarefas
function AddTaskForm({ onSubmit, setError }) {
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!titulo) {
            setError('O título é obrigatório!');
            return;
        }
        onSubmit(titulo, descricao);
        setTitulo('');
        setDescricao('');
    };

    return (
        <form className="add-task-form" onSubmit={handleSubmit}>
            <h3>Adicionar Nova Tarefa</h3>
            <input
                type="text"
                placeholder="Título da Tarefa"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
            />
            <textarea
                placeholder="Descrição (Opcional)"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
            />
            <button type="submit">Adicionar Tarefa</button>
        </form>
    );
}

export default App;