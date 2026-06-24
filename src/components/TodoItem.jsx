import './TodoItem.css'

export default function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className="item">
      <input
        className="item__check"
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
      />
      <span className={`item__title${todo.done ? ' item__title--done' : ''}`}>
        {todo.title}
      </span>
      <button className="item__delete" onClick={() => onDelete(todo.id)} aria-label="Delete">
        x
      </button>
    </li>
  )
}
