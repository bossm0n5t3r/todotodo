'use client';

import { invoke } from '@tauri-apps/api/core';
import { useEffect } from 'react';

import './App.css';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

type Task = {
  id: number;
  title: string;
  color: string;
  completed: boolean;
};

const saveTodo = async (task: Task): Promise<string> => {
  try {
    const result = await invoke('save_todo', { todoData: task });
    return result as string;
  } catch (error) {
    console.error('저장 중 오류 발생:', error);
    return '저장 중 오류가 발생했습니다.';
  }
};

const loadTodoList = async (): Promise<Task[]> => {
  try {
    const result = await invoke('load_todo_list');
    return result as Task[];
  } catch (error) {
    console.error('불러오기 중 오류 발생:', error);
    return [];
  }
};

const deleteTodo = async (task: Task): Promise<void> => {
  try {
    await invoke('delete_todo', { todoData: task });
  } catch (error) {
    console.error('삭제 중 오류 발생:', error);
  }
};

export default function App() {
  useEffect(() => {
    invoke('init');
    loadTodoList().then((result) => setTasks(result));
  }, []);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const addTask = () => {
    if (newTaskTitle.trim() !== '') {
      const newTask: Task = {
        id: Date.now(),
        title: newTaskTitle,
        color: `bg-${
          ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'purple'][
            Math.floor(Math.random() * 7)
          ]
        }-400`,
        completed: false,
      };
      setTasks([...tasks, newTask]);
      saveTodo(newTask);
      setNewTaskTitle('');
    }
  };

  const toggleTaskCompletion = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
    const targetTask = tasks.find((task) => task.id === id);
    if (targetTask) {
      saveTodo({
        ...targetTask,
        completed: !targetTask.completed,
      });
    }
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
    const targetTask = tasks.find((task) => task.id === id);
    if (targetTask) {
      deleteTodo(targetTask);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-xl shadow-lg">
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg group"
          >
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => toggleTaskCompletion(task.id)}
              className="rounded-full"
            />
            <div
              className={cn('w-5 h-5 rounded-full flex-shrink-0', task.color)}
            />
            <span
              className={cn(
                'flex-grow text-slate-700',
                task.completed && 'line-through text-slate-400',
              )}
            >
              {task.title}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4 text-slate-500" />
              <span className="sr-only">Delete task</span>
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-orange-200 flex-shrink-0" />
          <Input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            placeholder="Add something you want to do today"
            className="flex-grow border-none bg-transparent placeholder:text-slate-400 focus-visible:ring-0"
          />
          <Button variant="ghost" size="icon" onClick={addTask}>
            <Plus className="h-4 w-4 text-slate-500" />
            <span className="sr-only">Add task</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
