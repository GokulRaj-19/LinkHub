import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTeams } from '../hooks/useTeams';
import { useTasks } from '../hooks/useTasks';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { Plus, Users, Clock, CheckCircle2, Inbox, AlertTriangle } from 'lucide-react';

export default function KanbanView() {
  const { user } = useAuth();
  const { teams, loading: teamsLoading } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  useEffect(() => {
    if (teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  const {
    tasks, allTasks, loading: tasksLoading, error,
    statusFilter, setStatusFilter, addTask, updateStatus, updateProgress, removeTask,
  } = useTasks(selectedTeamId);

  const currentTeam = teams.find((t) => t.id === Number(selectedTeamId));
  const isLeader = currentTeam?.my_role === 'lead';

  const inProgressCount = allTasks.filter((t) => t.status === 'in_progress').length;
  const doneCount = allTasks.filter((t) => t.status === 'done').length;

  const tabs = [
    { key: 'all', label: `All Tasks (${allTasks.length})` },
    { key: 'in_progress', label: `In Progress (${inProgressCount})`, icon: Clock },
    { key: 'done', label: `Completed (${doneCount})`, icon: CheckCircle2 },
  ];

  const teamMembers = currentTeam
    ? JSON.parse(localStorage.getItem('linkhub_team_memberships') || '[]')
        .filter((m) => m.team_id === currentTeam.id)
        .map((m) => {
          const u = JSON.parse(localStorage.getItem('linkhub_users') || '[]').find((x) => x.id === m.user_id);
          return { user_id: m.user_id, name: u?.full_name || 'Member', role: m.role };
        })
    : [];

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      await removeTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header and Squad Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>Task Manager</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Assign tasks to squad members and track progress between In Progress and Completed.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {teams.length > 1 && (
            <select
              className="input"
              value={selectedTeamId || ''}
              onChange={(e) => setSelectedTeamId(Number(e.target.value))}
              style={{ minWidth: '180px', borderRadius: 'var(--radius-full)' }}
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}

          {isLeader && (
            <Button variant="primary" onClick={() => setIsModalOpen(true)} icon={Plus}>
              Assign Task
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto' }}>
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatusFilter(key)}
            className="btn btn-sm"
            style={{
              borderRadius: 'var(--radius-full)',
              backgroundColor: statusFilter === key ? 'var(--color-action)' : 'transparent',
              color: statusFilter === key ? 'var(--color-text-on-action)' : 'var(--color-text)',
              border: 'var(--card-border-width) solid var(--color-border)',
              gap: '6px',
            }}
          >
            {Icon && <Icon size={14} />}
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Task List Grid */}
      {teamsLoading || tasksLoading ? (
        <div className="state-box">Loading tasks...</div>
      ) : error ? (
        <div className="state-box" style={{ color: '#D32F2F' }}>{error}</div>
      ) : teams.length === 0 ? (
        <div className="state-box">
          <Users size={40} style={{ opacity: 0.6, marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No squad membership</h3>
          <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>Join or create a squad first to assign and manage tasks.</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="state-box">
          <Inbox size={40} style={{ opacity: 0.6, marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No tasks in this view</h3>
          <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>
            {statusFilter === 'all'
              ? isLeader ? 'Use the "Assign Task" button to assign work to squad members.' : 'No tasks currently assigned in this squad.'
              : 'No tasks matching this status filter.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isLeader={isLeader}
              currentUserId={user?.id}
              onUpdateStatus={updateStatus}
              onUpdateProgress={updateProgress}
              onDelete={(t) => setTaskToDelete(t)}
            />
          ))}
        </div>
      )}

      {/* Assign Task Modal */}
      {currentTeam && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={addTask}
          members={teamMembers}
        />
      )}

      {/* In-Page Confirm Delete Modal */}
      <Modal
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        title="Delete Task"
        maxWidth="440px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#D32F2F' }}>
            <AlertTriangle size={24} />
            <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Are you sure you want to delete this task?</span>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
            You are about to delete <strong>"{taskToDelete?.title}"</strong>. This action cannot be undone.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <Button variant="outline" onClick={() => setTaskToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmDelete}
              style={{ backgroundColor: '#D32F2F', borderColor: '#D32F2F', color: '#FFFFFF' }}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
