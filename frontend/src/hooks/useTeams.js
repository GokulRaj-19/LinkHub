import { useState, useEffect, useCallback } from 'react';
import { teamsApi } from '../api/teamsApi';
import { useAuth } from '../context/AuthContext';

export function useTeams(teamId = null) {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [teamDetail, setTeamDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTeams = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const data = await teamsApi.getTeams(user.id);
      setTeams(data);
    } catch (err) {
      setError(err.message || 'Failed to load teams.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchTeamDetail = useCallback(async (id) => {
    if (!user || !id) return;
    setLoading(true);
    setError('');
    try {
      const data = await teamsApi.getTeam(id, user.id);
      setTeamDetail(data);
    } catch (err) {
      setError(err.message || 'Failed to load team detail.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (teamId) {
      fetchTeamDetail(teamId);
    } else {
      fetchTeams();
    }
  }, [teamId, fetchTeams, fetchTeamDetail]);

  const createTeam = async (name, description) => {
    const created = await teamsApi.createTeam({ name, description, lead_id: user.id });
    await fetchTeams();
    return created;
  };

  const joinTeam = async (code) => {
    const result = await teamsApi.joinTeamByCode(code, user.id);
    await fetchTeams();
    return result;
  };

  const addMember = async (tId, email) => {
    const result = await teamsApi.addMemberByEmail(tId, email, user.id);
    if (teamId) await fetchTeamDetail(teamId);
    return result;
  };

  const removeMember = async (tId, targetUserId) => {
    await teamsApi.removeMember(tId, targetUserId, user.id);
    if (teamId) await fetchTeamDetail(teamId);
  };

  const regenerateCode = async (tId) => {
    const newCode = await teamsApi.regenerateCode(tId, user.id);
    if (teamId) {
      setTeamDetail((prev) => (prev ? { ...prev, team_code: newCode } : null));
    }
    return newCode;
  };

  return {
    teams,
    teamDetail,
    loading,
    error,
    fetchTeams,
    fetchTeamDetail,
    createTeam,
    joinTeam,
    addMember,
    removeMember,
    regenerateCode,
  };
}
