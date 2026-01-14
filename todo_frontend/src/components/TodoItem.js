import React, { useEffect, useRef, useState } from 'react';

/**
 * Single todo row with toggle, inline edit, and actions.
 *
 * @param {object} props
 * @param {{id: string, text: string, completed: boolean, createdAt: number}} props.todo
 * @param {(id: string, completed: boolean) => void} props.onToggle
 * @param {(id: string, nextText: string) => void} props.onEdit
 * @param {(id: string) => void} props.onDelete
 */
// PUBLIC_INTERFACE
export default function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(todo.text);

  const inputRef = useRef(null);

  useEffect(() => {
    // Sync draft text if the todo text changes externally.
    setDraftText(todo.text);
  }, [todo.text]);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const submitEdit = () => {
    const trimmed = draftText.trim();
    if (!trimmed) {
      // Avoid empty titles; keep user in edit mode.
      inputRef.current?.focus();
      return;
    }
    onEdit(todo.id, trimmed);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setDraftText(todo.text);
    setIsEditing(false);
  };

  return (
    <li className="todoItem" data-completed={todo.completed ? 'true' : 'false'}>
      <label className="todoToggle">
        <input
          className="todoCheckbox"
          type="checkbox"
          checked={todo.completed}
          onChange={(e) => onToggle(todo.id, e.target.checked)}
          aria-label={todo.completed ? 'Mark as not completed' : 'Mark as completed'}
        />
        <span className="todoCheckboxUi" aria-hidden="true" />
      </label>

      <div className="todoMain">
        {!isEditing ? (
          <div className="todoTextRow">
            <span className="todoText" title={todo.text}>
              {todo.text}
            </span>
            {todo.completed ? <span className="todoBadge">Done</span> : null}
          </div>
        ) : (
          <div className="todoEditRow">
            <input
              ref={inputRef}
              className="todoEditInput"
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitEdit();
                if (e.key === 'Escape') cancelEdit();
              }}
              aria-label="Edit task"
            />
            <div className="todoEditHelp" id={`todo-edit-help-${todo.id}`}>
              Press Enter to save, Escape to cancel
            </div>
          </div>
        )}
      </div>

      <div className="todoActions">
        {!isEditing ? (
          <>
            <button
              type="button"
              className="btn btnSecondary"
              onClick={() => setIsEditing(true)}
              aria-label={`Edit task: ${todo.text}`}
            >
              Edit
            </button>
            <button
              type="button"
              className="btn btnDanger"
              onClick={() => onDelete(todo.id)}
              aria-label={`Delete task: ${todo.text}`}
            >
              Delete
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="btn btnPrimary"
              onClick={submitEdit}
              aria-label={`Save changes for task: ${todo.text}`}
            >
              Save
            </button>
            <button
              type="button"
              className="btn btnGhost"
              onClick={cancelEdit}
              aria-label="Cancel editing"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </li>
  );
}
