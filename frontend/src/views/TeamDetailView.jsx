import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTeams } from '../hooks/useTeams';
import { useAuth } from '../context/AuthContext';
import { tasksApi } from '../api/tasksApi';
import TeamCodeBox from '../components/teams/TeamCodeBox';
import AddMemberForm from '../components/teams/AddMemberForm';
import MemberList from '../components/teams/MemberList';
import TaskModal from '../components/tasks/TaskModal';
import Button from '../components/common/Button';
import { Bookmark, CheckSquare, ArrowLeft, Plus } from 'lucide-react';

export default function TeamDetailView() {
  const { id } = useParams();
  const { user } = useAuth();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskSuccessMsg, setTaskSuccessMsg] = useState('');
  const {
    teamDetail,
    loading,
    error,
    addMember,
    removeMember,
    regenerateCode,
  } = useTeams(id);

  if (loading) return <div className="state-box">Loading squad details...</div>;
  if (error || !teamDetail) {
    return (
      <div className="state-box" style={{ color: '#D32F2F' }}>
        {error || 'Squad not found.'}
        <div style={{ marginTop: '16px' }}>
          <Link to="/teams" className="btn btn-outline btn-sm">
            <ArrowLeft size={14} /> Back to Squads
          </Link>
        </div>
      </div>
    );
  }

  const isLeader = Boolean(
    teamDetail.is_leader ||
    teamDetail.lead_id === user?.id ||
    teamDetail.my_role === 'lead' ||
    user?.role === 'admin'
  );

  const handleAssignTask = async (taskData) => {
    await tasksApi.createTask({
      ...taskData,
      team_id: teamDetail.id,
      created_by: user.id,
    });
    setTaskSuccessMsg(`Task "${taskData.title}" assigned successfully!`);
    setTimeout(() => setTaskSuccessMsg(''), 4000);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Back button */}
      <div style={{ marginBottom: '16px' }}>
        <Link to="/teams" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
          <ArrowLeft size={16} /> Back to Squads
        </Link>
      </div>

      {taskSuccessMsg && (
        <div role="status" style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(46,125,50,0.12)', border: '1px solid #2E7D32', color: '#2E7D32', fontSize: '0.9rem', marginBottom: '16px', fontWeight: 600 }}>
          {taskSuccessMsg}
        </div>
      )}

      {/* Header matching Page 2 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            {teamDetail.name}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
            {isLeader ? 'You are the Team Leader' : 'You are a Squad Member'} · {teamDetail.member_count} member{teamDetail.member_count !== 1 ? 's' : ''}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to={`/teams/${teamDetail.id}/links`} className="btn btn-outline" style={{ textDecoration: 'none' }}>
            <Bookmark size={18} />
            <span>Team Links</span>
          </Link>
          <Link to={`/tasks?teamId=${teamDetail.id}`} className="btn btn-outline" style={{ textDecoration: 'none' }}>
            <CheckSquare size={18} />
            <span>Tasks</span>
          </Link>
          {isLeader && (
            <Button variant="primary" onClick={() => setIsTaskModalOpen(true)} icon={Plus}>
              Assign Task
            </Button>
          )}
        </div>
      </div>

      {/* Top Grid: Team Code (Left) and Add Member + Member List (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Team Code Box */}
        <TeamCodeBox
          code={teamDetail.team_code}
          isLeader={isLeader}
          onRegenerate={() => regenerateCode(teamDetail.id)}
        />

        {/* Member Management Box */}
        <div className="card" style={{ padding: '24px' }}>
          {isLeader && (
            <AddMemberForm
              onAddMember={(email) => addMember(teamDetail.id, email)}
            />
          )}

          <div style={{ marginTop: isLeader ? '16px' : '0' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
              SQUAD MEMBERS ({teamDetail.members?.length || 0})
            </div>
            <MemberList
              members={teamDetail.members}
              isLeader={isLeader}
              onRemoveMember={(uId) => removeMember(teamDetail.id, uId)}
            />
          </div>
        </div>
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleAssignTask}
        members={teamDetail.members || []}
        isLeader={isLeader}
      />
    </div>
  );
}
