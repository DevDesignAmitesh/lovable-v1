import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Todo = {
  id: number
  text: string
  completed: boolean
}

type Filter = 'all' | 'active' | 'completed'

const initialTodos: Todo[] = [
  { id: 1, text: 'Add your first task', completed: false },
  { id: 2, text: 'Mark a task as complete', completed: true },
]

function App() {
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [newTodo, setNewTodo] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const filteredTodos = useMemo(() => {
    if (filter === 'active') {
      return todos.filter((todo) => !todo.completed)
    }

    if (filter === 'completed') {
      return todos.filter((todo) => todo.completed)
    }

    return todos
  }, [filter, todos])

  const remainingCount = todos.filter((todo) => !todo.completed).length
  const completedCount = todos.length - remainingCount

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedTodo = newTodo.trim()

    if (!trimmedTodo) {
      return
    }

    setTodos((currentTodos) => [
      ...currentTodos,
      {
        id: Date.now(),
        text: trimmedTodo,
        completed: false,
      },
    ])
    setNewTodo('')
  }

  function toggleTodo(id: number) {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    )
  }

  function deleteTodo(id: number) {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id))
  }

  function clearCompleted() {
    setTodos((currentTodos) => currentTodos.filter((todo) => !todo.completed))
  }

  return (
    <main className="app-shell">
      <section className="todo-card" aria-labelledby="todo-heading">
        <div className="hero">
          <p className="eyebrow">Simple productivity</p>
          <h1 id="todo-heading">Todo App</h1>
          <p className="subtitle">Capture tasks, check them off, and keep your day moving.</p>
        </div>

        <form className="todo-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="todo-input">
            New todo
          </label>
          <input
            id="todo-input"
            type="text"
            value={newTodo}
            onChange={(event) => setNewTodo(event.target.value)}
            placeholder="What needs to be done?"
          />
          <button type="submit">Add</button>
        </form>

        <div className="toolbar" aria-label="Todo filters">
          {(['all', 'active', 'completed'] as const).map((filterName) => (
            <button
              key={filterName}
              className={filter === filterName ? 'active' : ''}
              type="button"
              onClick={() => setFilter(filterName)}
            >
              {filterName}
            </button>
          ))}
        </div>

        <ul className="todo-list">
          {filteredTodos.map((todo) => (
            <li className={todo.completed ? 'completed' : ''} key={todo.id}>
              <label>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />
                <span>{todo.text}</span>
              </label>
              <button type="button" onClick={() => deleteTodo(todo.id)} aria-label={`Delete ${todo.text}`}>
                ×
              </button>
            </li>
          ))}
        </ul>

        {filteredTodos.length === 0 && (
          <p className="empty-state">No {filter === 'all' ? '' : filter} tasks to show.</p>
        )}

        <footer className="summary">
          <span>
            {remainingCount} active · {completedCount} completed
          </span>
          <button type="button" onClick={clearCompleted} disabled={completedCount === 0}>
            Clear completed
          </button>
        </footer>
      </section>
    </main>
  )
}

export default App
