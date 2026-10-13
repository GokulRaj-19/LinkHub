import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { AlertCircle } from 'lucide-react';

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  members = [],
  initialTask = null,
  isLeader = true,
}) {
  const isEditing = Boolean(initialTask);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assignedDate, setAssignedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setAssignedTo(initialTask.assigned_to || members[0]?.user_id || '');
      setPriority(initialTask.priority || 'medium');
      setAssignedDate(initialTask.assigned_date || new Date().toISOString().split('T')[0]);
      setDueDate(initialTask.due_date || '');
    } else {
      setTitle('');
      setDescription('');
      setAssignedTo(members[0]?.user_id || '');
      setPriority('medium');
      setAssignedDate(new Date().toISOString().split('T')[0]);
      setDueDate('');
    }
    setError('');
  }, [initialTask, isOpen, members]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    if (!title.trim()) return setError('Task title is required.');
    if (!assignedTo) return setError('Please select a squad member.');

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        assigned_to: Number(assignedTo),
        priority,
        assigned_date: assignedDate,
        due_date: dueDate.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || `Failed to ${isEditing ? 'update' : 'create'} task.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Task' : 'Assign Task to Member'}>
      {error && (
        <div role="alert" style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(211,47,47,0.12)', border: '1px solid #D32F2F', color: '#D32F2F', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <AlertCircle size={16} /> <span>{error}</span>
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
            disabled={!isLeader && isEditing}
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label className="label" htmlFor="task-assigned-date">Assigned Date *</label>
            <input
              id="task-assigned-date"
              type="date"
              className="input"
              value={assignedDate}
              onChange={(e) => setAssignedDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="task-due">Due Date</label>
            <input
              id="task-due"
              type="date"
              className="input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
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
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? (isEditing ? 'Saving...' : 'Assigning...') : (isEditing ? 'Save Changes' : 'Assign Task')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
