import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Percent, CheckCircle2, MessageSquare } from 'lucide-react';

export default function ProgressModal({
  isOpen,
  onClose,
  task,
  onSaveProgress,
}) {
  const [progress, setProgress] = useState(0);
  const [memberNotes, setMemberNotes] = useState('');

  useEffect(() => {
    if (task) {
      setProgress(task.progress || 0);
      setMemberNotes(task.member_notes || '');
    }
  }, [task, isOpen]);

  const presets = [0, 25, 50, 75, 100];

  const handleSave = () => {
    if (task) {
      onSaveProgress(task.id, progress, memberNotes);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Progress & Details" maxWidth="430px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Task</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '2px' }}>{task?.title}</div>
        </div>

        {/* Big percentage display & preview */}
        <div style={{ textAlign: 'center', padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-subtle)', border: '1px solid var(--color-border-subtle)' }}>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: progress === 100 ? '#2E7D32' : 'var(--color-action)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <span>{progress}%</span>
            {progress === 100 && <CheckCircle2 size={24} color="#2E7D32" />}
          </div>

          <div style={{ width: '100%', height: '8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-border-subtle)', overflow: 'hidden', marginTop: '8px' }}>
            <div style={{ width: `${progress}%`, height: '100%', backgroundColor: progress === 100 ? '#2E7D32' : 'var(--color-action)', transition: 'width var(--transition-fast)' }} />
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <label className="label">Quick Presets</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
            {presets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setProgress(val)}
                className="btn btn-sm"
                style={{
                  padding: '5px 0', fontSize: '0.8rem', fontWeight: 700, borderRadius: 'var(--radius-sm)',
                  backgroundColor: progress === val ? 'var(--color-action)' : 'transparent',
                  color: progress === val ? 'var(--color-text-on-action)' : 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {val}%
              </button>
            ))}
          </div>
        </div>

        {/* Range Slider & Manual Input */}
        <div>
          <label className="label" htmlFor="custom-progress">Adjust Percentage</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              id="custom-progress"
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--color-action)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', width: '70px' }}>
              <input
                type="number"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                className="input"
                style={{ padding: '4px 6px', textAlign: 'center', fontSize: '0.88rem' }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>%</span>
            </div>
          </div>
        </div>

        {/* Member Details Message Box */}
        <div>
          <label className="label" htmlFor="member-notes" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MessageSquare size={13} color="var(--color-action)" />
            <span>What have you done? (Work Details)</span>
          </label>
          <textarea
            id="member-notes"
            className="input"
            rows={2}
            value={memberNotes}
            onChange={(e) => setMemberNotes(e.target.value)}
            placeholder="Add details about what you have done on this task..."
            style={{ fontSize: '0.85rem' }}
          />
        </div>

        {progress === 100 && (
          <p style={{ fontSize: '0.82rem', color: '#2E7D32', fontWeight: 600, margin: 0 }}>
            ✓ Setting progress to 100% will automatically mark this task as Completed.
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} icon={Percent}>Save Updates</Button>
        </div>
      </div>
    </Modal>
  );
}
