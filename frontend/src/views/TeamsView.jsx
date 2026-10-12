import React, { useState } from 'react';
import { useTeams } from '../hooks/useTeams';
import TeamCard from '../components/teams/TeamCard';
import CreateTeamModal from '../components/teams/CreateTeamModal';
import JoinTeamForm from '../components/teams/JoinTeamForm';
import Button from '../components/common/Button';
import { Plus, Users } from 'lucide-react';

export default function TeamsView() {
  const { teams, loading, error, createTeam, joinTeam } = useTeams();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            Squads & Teams
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Collaborate with your teammates, share resources, and assign tasks.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsCreateOpen(true)} icon={Plus}>
          Create Squad
        </Button>
      </div>

      {/* Join Squad Form */}
      <div style={{ marginBottom: '32px' }}>
        <JoinTeamForm onJoin={joinTeam} />
      </div>

      {/* Teams List */}
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={20} /> My Squads
        </h2>

        {loading ? (
          <div className="state-box">Loading your squads...</div>
        ) : error ? (
          <div className="state-box" style={{ color: '#D32F2F' }}>{error}</div>
        ) : teams.length === 0 ? (
          <div className="state-box">
            <Users size={40} style={{ opacity: 0.6, marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No squads yet</h3>
            <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>
              Create a new squad or enter a team code above to join one.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}
      </div>

      <CreateTeamModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={createTeam}
      />
    </div>
  );
}
