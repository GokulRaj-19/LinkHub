import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { AlertCircle } from 'lucide-react';

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  members = [],
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState(members[0]?.user_id || '');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // Prevent double-click creation
    setError('');

    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }
    if (!assignedTo) {
      setError('Please select a squad member to assign this task to.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title,
        description,
        assigned_to: Number(assignedTo),
        priority,
        due_date: dueDate.trim(),
      });
      setTitle('');
      setDescription('');
      setDueDate('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Task to Member">
      {error && (
        <div
          role="alert"
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(211, 47, 47, 0.12)',
            border: '1px solid #D32F2F',
            color: '#D32F2F',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label className="label" htmlFor="task-title">Task Title *</label>
          <input
            id="task-title"
            type="text"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Design team page"
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="task-assigned">Assign to Squad Member *</label>
          <select
            id="task-assigned"
            className="input"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            required
          >
            <option value="">Select a member...</option>
            {members.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.name} ({m.role})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label className="label" htmlFor="task-priority">Priority</label>
            <select
              id="task-priority"
              className="input"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="label" htmlFor="task-due">Due Date</label>
            <input
              id="task-due"
              type="text"
              className="input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="e.g. Oct 20"
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="task-desc">Description</label>
          <textarea
            id="task-desc"
            className="input"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key deliverables or notes"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Assigning...' : 'Assign Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
