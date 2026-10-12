# LinkHub REST API Endpoints Specification

| Area | Endpoint | HTTP Method | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/register` | POST | Public | Register new user (name, email, password) |
| | `/api/auth/login` | POST | Public | Login with email and password |
| | `/api/auth/logout` | POST | Authenticated | Invalidate session |
| **Profile** | `/api/users/me` | GET, PATCH | Authenticated | View and update profile, change password |
| | `/api/users/me/theme`| PATCH | Authenticated | Update user theme preference (`sketch`, `brand`, `dark`, `hc`) |
| **My Links** | `/api/links` | GET, POST | Owner | Get vault links (with search/filter/sort) / Create link |
| | `/api/links/:id` | PATCH, DELETE| Owner | Edit link / Soft delete link |
| | `/api/links/:id/star`| PATCH | Owner | Toggle favourite star state |
| | `/api/links/:id/pin` | PATCH | Owner | Toggle pinned state (updates `pinned_at`) |
| | `/api/links/:id/click`| POST | Owner | Increment click counter |
| **Categories**| `/api/categories` | GET, POST | Owner | List categories / Create category (unique name check) |
| | `/api/categories/:id`| PATCH, DELETE| Owner | Edit category / Delete category with `move_to` reassignment |
| **Teams** | `/api/teams` | POST | Authenticated | Create squad (creator assigned as lead, 8-char code) |
| | `/api/teams/mine` | GET | Authenticated | List all squads the user belongs to |
| | `/api/teams/:id` | GET | Member/Lead | Get squad details, member list |
| | `/api/teams/join` | POST | Authenticated | Join squad using 8-character case-insensitive team code |
| | `/api/teams/:id/members`| POST | Leader | Add member by email (or record pending invitation) |
| | `/api/teams/:id/members/:user_id`| DELETE | Leader | Remove member (unassigns their active tasks) |
| | `/api/teams/:id/code/regenerate`| POST | Leader | Regenerate 8-character team code |
| | `/api/teams/:id/code`| PATCH | Leader | Toggle code active status |
| **Team Links**| `/api/teams/:id/links`| GET, POST | Member/Lead | Get shared links / Post new team link |
| **Tasks** | `/api/teams/:id/tasks`| GET | Member/Lead | List team tasks |
| | `/api/teams/:id/tasks`| POST | Leader | Assign new task to squad member (idempotent) |
| | `/api/tasks/:id` | PATCH | Member/Lead | Update task status (`in_progress`, `done`) |
| | `/api/tasks/:id` | DELETE | Leader | Delete task |
| **Admin** | `/api/admin/logs` | GET | Admin | View audit logs |
| | `/api/admin/logs/export`| GET | Admin | Export CSV audit logs |
