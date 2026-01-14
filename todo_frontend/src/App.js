import React, { useMemo, useState } from 'react';
import './App.css';
import TodoItem from './components/TodoItem';
import { useLocalStorage } from './hooks/useLocalStorage';

const STORAGE_KEY = 'kavia.todo.items';

const FILTERS = /** @type {const} */ ({
  all: 'All',
  active: 'Active',
  completed: 'Completed',
});

/**
 * Generate a reasonably unique id without external deps.
 * (crypto.randomUUID is not supported in all older environments).
 */
function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Main SPA for managing todos.
 */
// PUBLIC_INTERFACE
function App() {
  const [todos, setTodos] = useLocalStorage(STORAGE_KEY, []);
  const [newText, setNewText] = useState('');
  const [filter, setFilter] = useState('all');

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    return { total, completed, remaining: total - completed };
  }, [todos]);

  // Derive visible items from the full persisted list.
  // This ensures switching filters never mutates or deletes stored tasks.
  const visibleTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((t) => !t.completed);
    if (filter === 'completed') return todos.filter((t) => t.completed);
    return todos;
  }, [todos, filter]);

  const addTodo = () => {
    const trimmed = newText.trim();
    if (!trimmed) return;

    const next = [
      {
        id: createId(),
        text: trimmed,
        completed: false,
        createdAt: Date.now(),
      },
      ...todos,
    ];

    setTodos(next);
    setNewText('');
  };

  const toggleTodo = (id, completed) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)));
  };

  const editTodo = (id, nextText) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text: nextText } : t)));
  };

  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((t) => !t.completed));
  };

  return (
    <div className="App">
      <div className="page">
        <header className="header">
          <div className="brand">
            <div className="brandMark" aria-hidden="true" />
            <div className="brandText">
              <h1 className="title">Todo</h1>
              <p className="subtitle">A simple list with edit, complete, and local persistence.</p>
            </div>
          </div>

          <div className="stats" aria-label="Todo stats">
            <span className="statPill">
              <span className="statLabel">Total</span>
              <span className="statValue">{stats.total}</span>
            </span>
            <span className="statPill">
              <span className="statLabel">Remaining</span>
              <span className="statValue">{stats.remaining}</span>
            </span>
            <span className="statPill statPillSuccess">
              <span className="statLabel">Done</span>
              <span className="statValue">{stats.completed}</span>
            </span>
          </div>
        </header>

        <main className="content">
          <section className="card" aria-labelledby="add-task-title">
            <h2 id="add-task-title" className="cardTitle">
              Add a task
            </h2>

            <form
              className="addForm"
              onSubmit={(e) => {
                e.preventDefault();
                addTodo();
              }}
            >
              <label className="srOnly" htmlFor="new-todo">
                Task name
              </label>
              <input
                id="new-todo"
                className="textInput"
                placeholder="e.g., Buy groceries"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                autoComplete="off"
              />
              <button type="submit" className="btn btnPrimary" disabled={!newText.trim()}>
                Add
              </button>
            </form>

            <div className="toolbar" role="region" aria-label="List actions">
              <div className="filterGroup" role="group" aria-label="Filter tasks">
                {Object.entries(FILTERS).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`btn btnFilter ${filter === key ? 'btnFilterActive' : ''}`}
                    onClick={() => setFilter(key)}
                    aria-pressed={filter === key}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="btn btnGhost"
                onClick={clearCompleted}
                disabled={stats.completed === 0}
              >
                Clear completed
              </button>
            </div>
          </section>

          <section className="card" aria-labelledby="list-title">
            <h2 id="list-title" className="cardTitle">
              Your tasks
            </h2>

            {todos.length === 0 ? (
              <div className="empty">
                <p className="emptyTitle">No tasks yet</p>
                <p className="emptyHint">Add your first task above to get started.</p>
              </div>
            ) : visibleTodos.length === 0 ? (
              <div className="empty" role="status" aria-live="polite">
                <p className="emptyTitle">Nothing here</p>
                <p className="emptyHint">
                  {filter === 'active'
                    ? 'All tasks are completed. Switch to Completed to view them.'
                    : filter === 'completed'
                      ? 'No completed tasks yet. Switch to Active to see what’s next.'
                      : 'Add your first task above to get started.'}
                </p>
              </div>
            ) : (
              <ul className="todoList" aria-label="Todo list">
                {visibleTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={toggleTodo}
                    onEdit={editTodo}
                    onDelete={deleteTodo}
                  />
                ))}
              </ul>
            )}
          </section>
        </main>

        <footer className="footer">
          <p className="footerText">
            Tip: Click <strong>Edit</strong> to change a task. Use <strong>Enter</strong> to save and{' '}
            <strong>Escape</strong> to cancel.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
