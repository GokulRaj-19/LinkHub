import { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '../api/tasksApi';
import { useAuth } from '../context/AuthContext';

export function useTasks(teamId = null) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchTasks = useCallback(async () => {
    if (!teamId) return;
    setLoading(true);
    setError('');
    try {
      const data = await tasksApi.getTasks(teamId);
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (payload) => {
    const created = await tasksApi.createTask({
      ...payload,
      team_id: teamId,
      created_by: user.id,
    });
    await fetchTasks();
    return created;
  };

  const updateStatus = async (taskId, newStatus) => {
    await tasksApi.updateTaskStatus(taskId, newStatus, user.id);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? {
        ...t,
        status: newStatus,
        progress: newStatus === 'done' ? 100 : (t.progress === 100 ? 50 : t.progress),
      } : t))
    );
  };

  const updateProgress = async (taskId, newProgress, memberNotes = null) => {
    await tasksApi.updateTaskProgress(taskId, newProgress, user.id, memberNotes);
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const p = Math.max(0, Math.min(100, Math.round(Number(newProgress) || 0)));
        const newStatus = p === 100 ? 'done' : (t.status === 'done' && p < 100 ? 'in_progress' : t.status);
        const updated = { ...t, progress: p, status: newStatus };
        if (memberNotes !== null && memberNotes !== undefined) updated.member_notes = memberNotes.trim();
        return updated;
      })
    );
  };

  const editTask = async (taskId, updates) => {
    await tasksApi.updateTask(taskId, updates, user.id);
    await fetchTasks();
  };

  const removeTask = async (taskId) => {
    await tasksApi.deleteTask(taskId, user.id);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    fetchTasks,
    addTask,
    editTask,
    updateStatus,
    updateProgress,
    removeTask,
  };
}
