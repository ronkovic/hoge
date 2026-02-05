import type { Todo } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export const TodoItem = ({ todo, onToggle, onDelete }: TodoItemProps) => {
  return (
    <div data-testid="todo-item" style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ccc' }}>
      <div data-testid="todo-id">ID: {todo.id}</div>
      <div data-testid="todo-title">{todo.title}</div>
      <div data-testid="todo-status">{todo.completed ? '完了' : '未完了'}</div>
      <button data-testid="todo-toggle" onClick={() => onToggle(todo.id)}>
        {todo.completed ? '未完了に戻す' : '完了にする'}
      </button>
      <button data-testid="todo-delete" onClick={() => onDelete(todo.id)} style={{ marginLeft: '10px' }}>
        削除
      </button>
    </div>
  );
};
