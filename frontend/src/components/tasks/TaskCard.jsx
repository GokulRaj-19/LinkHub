import React, { useState } from 'react';
import { Calendar, User, CheckCircle2, Clock, Trash2, Percent, Edit2 } from 'lucide-react';
import ProgressModal from './ProgressModal';
import TaskWorkDetails from './TaskWorkDetails';

export default function TaskCard({
  task,
  isLeader = false,
  currentUserId,
  onUpdateStatus,
  onUpdateProgress,
  onEdit,
  onDelete,
}) {
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const isAssignee = task.assigned_to === Number(currentUserId);
  const canEdit = isLeader;
  const canManageProgress = isAssignee;
  const isDone = task.status === 'done';

  const getPriorityStyle = (p) => {
    const key = p?.toLowerCase();
    if (key === 'high') return { color: 'var(--priority-high)', backgroundColor: 'var(--priority-high-bg)' };
    if (key === 'medium' || key === 'med') return { color: 'var(--priority-med)', backgroundColor: 'var(--priority-med-bg)' };
    return { color: 'var(--priority-low)', backgroundColor: 'var(--priority-low-bg)' };
  };

  return (
    <article
      className="card"
      style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '16px', opacity: isDone ? 0.8 : 1,
        borderLeft: isDone ? '4px solid #2E7D32' : '4px solid var(--color-action)',
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-heading)', textDecoration: isDone ? 'line-through' : 'none' }}>
            {task.title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="badge" style={{ ...getPriorityStyle(task.priority), textTransform: 'capitalize', fontSize: '0.75rem' }}>
              {task.priority}
            </span>
            {isLeader && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(task)}
                aria-label={`Delete task ${task.title}`}
                className="btn-icon"
                style={{ padding: '3px', color: '#D32F2F' }}
                title="Delete Task"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        {task.description && (
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
            {task.description}
          </p>
        )}

        {/* Member and Dates Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-subtle)', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--color-border-subtle)', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <User size={13} />
            <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{task.assignee_name}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.76rem' }}>
            {task.assigned_date && (
              <span title="Assigned Date" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <Calendar size={12} color="var(--color-action)" /> {task.assigned_date}
              </span>
            )}
            {task.due_date && (
              <span title="Due Date" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <Clock size={12} color="#E65100" /> Due: {task.due_date}
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar Display */}
        <div style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', marginBottom: '4px' }}>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Progress</span>
            <span style={{ fontWeight: 800, color: isDone ? '#2E7D32' : 'var(--color-action)' }}>
              {task.progress || 0}%
            </span>
          </div>
          <div style={{ width: '100%', height: '5px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-border-subtle)', overflow: 'hidden' }}>
            <div style={{ width: `${task.progress || 0}%`, height: '100%', backgroundColor: isDone ? '#2E7D32' : 'var(--color-action)', transition: 'width var(--transition-fast)' }} />
          </div>
        </div>

        <TaskWorkDetails task={task} canManageProgress={canManageProgress} onOpenModal={() => setIsProgressOpen(true)} />
      </div>

      {/* Process & Status Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--color-border-subtle)', flexWrap: 'wrap', gap: '8px' }}>
        <span
          className="badge"
          style={{
            backgroundColor: isDone ? 'rgba(46, 125, 50, 0.15)' : 'rgba(112, 72, 224, 0.15)',
            color: isDone ? '#2E7D32' : 'var(--color-action)',
            fontSize: '0.75rem', fontWeight: 700,
          }}
        >
          {isDone ? 'Completed' : 'In Progress'}
        </span>

        {(canEdit || canManageProgress) && (
          <div style={{ display: 'flex', gap: '6px' }}>
            {canEdit && onEdit && (
              <button
                type="button"
                onClick={() => onEdit(task)}
                className="btn btn-sm btn-outline"
                style={{ padding: '4px 8px', fontSize: '0.78rem', gap: '4px' }}
                title="Edit Task Details"
              >
                <Edit2 size={12} color="var(--color-text-muted)" />
                <span>Edit</span>
              </button>
            )}

            {canManageProgress && (
              <>
                <button
                  type="button"
                  onClick={() => setIsProgressOpen(true)}
                  className="btn btn-sm btn-outline"
                  style={{ padding: '4px 8px', fontSize: '0.78rem', gap: '4px' }}
                  title="Update Progress Percentage"
                >
                  <Percent size={12} color="var(--color-action)" />
                  <span>{task.progress ? `${task.progress}%` : '%'}</span>
                </button>

                {!isDone ? (
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(task.id, 'done')}
                    className="btn btn-sm btn-outline"
                    style={{ padding: '4px 10px', fontSize: '0.78rem', gap: '4px' }}
                  >
                    <CheckCircle2 size={13} color="#2E7D32" />
                    <span>Complete</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(task.id, 'in_progress')}
                    className="btn btn-sm btn-outline"
                    style={{ padding: '4px 10px', fontSize: '0.78rem', gap: '4px' }}
                  >
                    <Clock size={13} color="var(--color-action)" />
                    <span>In Progress</span>
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {canManageProgress && onUpdateProgress && (
        <ProgressModal
          isOpen={isProgressOpen}
          onClose={() => setIsProgressOpen(false)}
          task={task}
          onSaveProgress={onUpdateProgress}
        />
      )}
    </article>
  );
}
