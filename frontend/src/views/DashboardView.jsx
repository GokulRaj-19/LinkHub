import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { linksApi } from "../api/linksApi";
import { teamsApi } from "../api/teamsApi";
import { tasksApi } from "../api/tasksApi";
import {
  Bookmark,
  Pin,
  Users,
  CheckSquare,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

export default function DashboardView() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    links: 0,
    pinned: 0,
    teams: 0,
    tasks: 0,
  });

  const [pinnedLinks, setPinnedLinks] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const [linkData, teamData] = await Promise.all([
          linksApi.getLinks(user.id),
          teamsApi.getTeams(user.id),
        ]);

        const allLinks = linkData.all || [];
        const pinned = linkData.pinned || [];
        const teams = Array.isArray(teamData) ? teamData : [];

        const taskResults = await Promise.allSettled(
          teams.map((team) => tasksApi.getTasks(team.id)),
        );

        const allTasks = taskResults
          .filter((result) => result.status === "fulfilled")
          .flatMap((result) => result.value || []);

        const myTasks = allTasks.filter(
          (task) =>
            String(task.assigned_to) === String(user.id) &&
            task.status !== "done",
        );

        if (!active) return;

        setStats({
          links: allLinks.length,
          pinned: pinned.length,
          teams: teams.length,
          tasks: myTasks.length,
        });

        setPinnedLinks(pinned.slice(0, 4));
        setAssignedTasks(myTasks.slice(0, 3));
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load dashboard data.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [user]);

  const statCards = [
    { label: "Saved Links", value: stats.links, Icon: Bookmark },
    { label: "Pinned Vault", value: stats.pinned, Icon: Pin },
    { label: "Active Squads", value: stats.teams, Icon: Users },
    { label: "Pending Tasks", value: stats.tasks, Icon: CheckSquare },
  ];

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <div
        style={{
          marginBottom: "28px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        <img
          src="/logo.png"
          alt="LinkHub"
          className="app-logo"
          style={{ width: "48px", height: "48px", flexShrink: 0 }}
        />

        <div>
          <h1
            style={{
              fontSize: "1.85rem",
              fontWeight: 800,
              fontFamily: "var(--font-heading)",
            }}
          >
            Welcome back, {user?.full_name}
          </h1>

          <p
            style={{
              color: "var(--color-text-muted)",
              marginTop: "2px",
            }}
          >
            Here is your LinkHub activity overview across your vault and squads.
          </p>
        </div>
      </div>

      {error && (
        <div className="state-box" role="alert">
          {error}
        </div>
      )}

      {loading && <div className="state-box">Loading dashboard data...</div>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {statCards.map(({ label, value, Icon }) => (
          <div
            className="card"
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                padding: "12px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--color-surface-subtle)",
              }}
            >
              <Icon size={24} color="var(--color-action)" />
            </div>

            <div>
              <div style={{ fontSize: "1.6rem", fontWeight: 800 }}>{value}</div>

              <div
                style={{
                  fontSize: "0.85rem",
                  color: "var(--color-text-muted)",
                }}
              >
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
        }}
      >
        {/* Pinned links */}
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h2
              style={{
                fontSize: "1.15rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Pin size={18} />
              Pinned Vault Links
            </h2>

            <Link
              to="/links"
              style={{
                fontSize: "0.85rem",
                color: "var(--color-action)",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {pinnedLinks.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "24px 0",
                color: "var(--color-text-muted)",
                fontSize: "0.9rem",
              }}
            >
              No pinned links yet. Pin important links from your vault to view
              them here.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {pinnedLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border-subtle)",
                    backgroundColor: "var(--color-surface)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                      {link.title}
                    </div>

                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {link.url}
                    </div>
                  </div>

                  <ExternalLink size={14} color="var(--color-text-muted)" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Assigned tasks */}
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h2
              style={{
                fontSize: "1.15rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <CheckSquare size={18} />
              My Active Tasks
            </h2>

            <Link
              to="/tasks"
              style={{
                fontSize: "0.85rem",
                color: "var(--color-action)",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              Task Manager <ArrowRight size={14} />
            </Link>
          </div>

          {assignedTasks.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "24px 0",
                color: "var(--color-text-muted)",
                fontSize: "0.9rem",
              }}
            >
              You have no pending assigned tasks!
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {assignedTasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border-subtle)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                      {task.title}
                    </div>

                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      Due {task.due_date || "Soon"} · Priority: {task.priority}
                    </div>
                  </div>

                  <span
                    className="badge"
                    style={{ textTransform: "capitalize" }}
                  >
                    {(task.status || "pending").replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
