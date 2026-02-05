import { useState } from 'react';

interface TodoFormProps {
  onSubmit: (title: string) => void;
}

export const TodoForm = ({ onSubmit }: TodoFormProps) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title);
      setTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <input
        data-testid="todo-input"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="新しいTodoを入力"
        style={{ padding: '5px', marginRight: '10px' }}
      />
      <button data-testid="todo-submit" type="submit">
        追加
      </button>
    </form>
  );
};
