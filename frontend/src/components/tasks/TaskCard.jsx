import React from 'react';
import { Calendar, User, CheckCircle2, Clock, Trash2 } from 'lucide-react';

export default function TaskCard({
  task,
  isLeader = false,
  currentUserId,
  onUpdateStatus,
  onDelete,
}) {
  const isAssignee = task.assigned_to === Number(currentUserId);
  const canUpdate = isLeader || isAssignee;

  const getPriorityStyle = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return { color: 'var(--priority-high)', backgroundColor: 'var(--priority-high-bg)' };
      case 'medium':
      case 'med':
        return { color: 'var(--priority-med)', backgroundColor: 'var(--priority-med-bg)' };
      default:
        return { color: 'var(--priority-low)', backgroundColor: 'var(--priority-low-bg)' };
    }
  };

  const isDone = task.status === 'done';

  return (
    <article
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px',
        opacity: isDone ? 0.8 : 1,
        borderLeft: isDone ? '4px solid #2E7D32' : '4px solid var(--color-action)',
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              textDecoration: isDone ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              className="badge"
              style={{
                ...getPriorityStyle(task.priority),
                textTransform: 'capitalize',
                fontSize: '0.75rem',
              }}
            >
              {task.priority}
            </span>

            {isLeader && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(task)}
                aria-label={`Delete task ${task.title}`}
                className="btn-icon"
                style={{ padding: '3px', color: '#D32F2F' }}
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

        {/* Member and Due Date Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: 'var(--color-text-subtle)',
            marginTop: '14px',
            paddingTop: '8px',
            borderTop: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <User size={13} />
            <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
              {task.assignee_name}
            </span>
          </div>

          {task.due_date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} />
              <span>{task.due_date}</span>
            </div>
          )}
        </div>
      </div>

      {/* Process & Status Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '14px',
          paddingTop: '10px',
          borderTop: '1px solid var(--color-border-subtle)',
        }}
      >
        <span
          className="badge"
          style={{
            backgroundColor: isDone ? 'rgba(46, 125, 50, 0.15)' : 'rgba(112, 72, 224, 0.15)',
            color: isDone ? '#2E7D32' : 'var(--color-action)',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          {isDone ? 'Completed' : 'In Progress'}
        </span>

        {canUpdate && (
          <div style={{ display: 'flex', gap: '6px' }}>
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
          </div>
        )}
      </div>
    </article>
  );
}
