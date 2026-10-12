# LinkHub Project Document (v2.0)

## 01 Project at a glance
- **Product:** LinkHub: A link management system for individuals and teams
- **Users:** Individual user (default), Team Leader (creator of a team), Team Member, Admin (audit and system)
- **Primary goal:** Personal link vault with star and pin, custom categories, team creation with join code, team task assignment, 4 selectable themes
- **Delivery:** Responsive SPA (React 19 + Vite), Flask 3.x REST API, PostgreSQL 16+

## 02 Core concept
Every person who registers is an individual user with a private link vault:
1. Save, edit, delete, star and pin their own links.
2. Create custom categories to organise those links.
3. Create a team and automatically become its Team Leader.
4. Add members by email or share an 8-character team code.
5. As leader, assign tasks to members and track process between In Progress and Completed.
6. Instant theme switching across 4 themes: Sketch, Brand Light, Dark, High Contrast.

## 03 Roles and Permissions
| Capability | Individual user | Team Member | Team Leader | Admin |
| :--- | :--- | :--- | :--- | :--- |
| Manage own links, stars, pins, categories | Yes | Yes | Yes | Yes |
| Create a team | Yes | Yes | Yes | Yes |
| Join a team with code | Yes | n/a | n/a | Yes |
| View team links and tasks | No | Yes | Yes | Read-only |
| Add members by email | No | No | Yes | No |
| Regenerate or disable team code | No | No | Yes | No |
| Remove member | No | No | Yes | No |
| Create and assign tasks | No | No | Yes | No |
| Update status of own assigned task | No | Yes | Yes | No |
| View audit logs | No | No | No | Yes |

*Rule:* A leader cannot leave a team until leadership is transferred or the team is deleted.
