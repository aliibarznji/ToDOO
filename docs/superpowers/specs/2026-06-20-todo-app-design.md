# Todo App Design

**Date:** 2026-06-20  
**Stack:** Vite + React + react-hook-form  
**Scope:** Single-page todo list, in-memory, minimal UI

---

## Requirements

- Add todo by title only (no description, no due date, no priority)
- Mark todo done/undone via checkbox
- Delete todo
- No persistence (resets on reload)
- No filtering
- Minimal/clean UI (white, light gray)

---

## Architecture

Two components:

### `App.jsx`
- Owns `todos: Array<{ id: string, title: string, done: boolean }>`
- Uses `useForm` from `react-hook-form` for the add-todo input
- Validation: title required, whitespace trimmed
- On submit: appends new todo, resets form
- Passes `onToggle` and `onDelete` handlers down to `TodoItem`

### `TodoItem.jsx`
- Props: `{ todo, onToggle, onDelete }`
- Renders: checkbox (bound to `todo.done`) + title + delete button
- Completed todos show title with strikethrough

---

## Data Shape

```ts
type Todo = {
  id: string;      // crypto.randomUUID()
  title: string;
  done: boolean;
}
```

---

## File Structure

```
src/
  App.jsx
  App.css
  components/
    TodoItem.jsx
    TodoItem.css
main.jsx
index.html
```

---

## UI

- White card centered on page
- Input + "Add" button side by side
- Todo list below, each row: checkbox | title | delete button
- Completed title: `text-decoration: line-through`, gray color
- No routing, no state library, no external UI kit
