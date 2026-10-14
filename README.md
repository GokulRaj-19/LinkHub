# LinkHub - Link Management System (React 19 + Vite Frontend)

LinkHub is a responsive web application designed for personal bookmark vaults, squad collaboration, team link sharing, and member task progress management with 4 selectable themes.

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### Running Locally
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies (React 19, React Router, Lucide React, Vite)
npm install

# 3. Start the development server
npm run dev
```

The application will be live at `http://localhost:5174/`.

### Building for Production
```bash
npm run build
npm run preview
```

---

## 👥 Built-in Demo Accounts

For instant testing, demo accounts can be selected directly with one click on the Sign In page:

| Role | Account Email | Default Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Team Leader** | `priya@example.com` | `password123` | Leader of "Platform Squad", can assign tasks, manage join code, add/remove members |
| **Team Member** | `ravi@example.com` | `password123` | Member of "Platform Squad", can update progress on assigned tasks, copy team links |
| **Team Member** | `meena@example.com` | `password123` | Member of "Platform Squad", can update progress on assigned tasks |
| **System Admin** | `admin@linkhub.dev` | `adminpassword` | Access to `/admin/logs` with audit filtering and CSV export |

---

## 🎨 4 Selectable Themes (Instant CSS Switching)

Themes are powered entirely by CSS custom properties and instant `[data-theme]` switching on the root `<html>` element:

1. **Sketch (Default):** Pure black & white hand-drawn look with 10px repeating striped bar, dashed notes/tags, and Google Font *Architects Daughter*.
2. **Brand Light:** Modern canvas `#F3F5FC`, violet action button `#7048E0`, violet-to-cyan gradient stripe, and *Figtree* / *Sora* fonts.
3. **Dark:** Deep navy background `#0E1130`, card surface `#181C42`, vibrant purple action `#8B6CF0`.
4. **High Contrast:** High-accessibility theme with pure black `#000000`, 2px solid white card borders, and yellow/black hazard diagonal stripe.

---

## 📁 Exact Project Structure

```
linkhub/
├── README.md
├── docker-compose.yml          # postgres + backend + frontend
├── .gitignore
├── docs/
│   ├── LinkHub_Project_Document.md
│   ├── api-endpoints.md
│   ├── db-schema.md
│   └── ui-design-link.md
│
├── backend/                    # Flask 3.x REST API (<200 lines/file)
│   ├── run.py
│   ├── seed.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── app/
│   │   ├── config.py
│   │   ├── extensions.py
│   │   ├── models/             # User, SavedLink, Category, Team, Task, AuditLog
│   │   ├── routes/             # auth, users, links, categories, teams, tasks, admin
│   │   └── utils/              # rate_limit, audit, decorators, helpers
│   └── tests/                  # 22 automated pytest unit & integration tests
│
└── frontend/                   # React 19 + Vite
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── routes.jsx          # route list + protected route guards
        ├── api/                # Mock API layer
        │   ├── client.js       # localStorage client with simulated latency
        │   ├── authApi.js
        │   ├── linksApi.js
        │   ├── categoriesApi.js
        │   ├── teamsApi.js
        │   └── tasksApi.js
        ├── mock/
        │   └── seed.js         # Initial mock database seed
        ├── context/
        │   ├── AuthContext.jsx
        │   └── ThemeContext.jsx
        ├── hooks/
        │   ├── useLinks.js
        │   ├── useTeams.js
        │   └── useTasks.js
        ├── views/              # one file per screen (< 200 lines)
        │   ├── LoginView.jsx
        │   ├── RegisterView.jsx
        │   ├── DashboardView.jsx
        │   ├── MyLinksView.jsx
        │   ├── TeamsView.jsx
        │   ├── TeamDetailView.jsx
        │   ├── TeamLinksView.jsx
        │   ├── KanbanView.jsx
        │   ├── AppearanceView.jsx
        │   ├── ProfileView.jsx
        │   ├── AdminLogsView.jsx
        │   ├── Error403View.jsx
        │   ├── Error404View.jsx
        │   └── Error500View.jsx
        ├── components/
        │   ├── layout/
        │   │   ├── Sidebar.jsx
        │   │   ├── MobileTabBar.jsx
        │   │   └── StripeBar.jsx
        │   ├── links/
        │   │   ├── LinkCard.jsx
        │   │   ├── LinkModal.jsx
        │   │   ├── StarButton.jsx
        │   │   └── PinButton.jsx
        │   ├── categories/
        │   │   ├── CategoryChips.jsx
        │   │   └── CategoryModal.jsx
        │   ├── teams/
        │   │   ├── TeamCard.jsx
        │   │   ├── CreateTeamModal.jsx
        │   │   ├── JoinTeamForm.jsx
        │   │   ├── TeamCodeBox.jsx
        │   │   ├── AddMemberForm.jsx
        │   │   └── MemberList.jsx
        │   ├── tasks/
        │   │   ├── KanbanColumn.jsx
        │   │   ├── TaskCard.jsx
        │   │   └── TaskModal.jsx
        │   └── common/
        │       ├── Button.jsx
        │       ├── Modal.jsx
        │       ├── SearchInput.jsx
        │       └── ThemeCard.jsx
        └── styles/
            ├── index.css
            ├── base.css
            ├── theme-sketch.css
            ├── theme-light.css
            ├── theme-dark.css
            └── theme-contrast.css
```

---

## 🔄 Swapping the Mock API for a Real Backend (Flask 3.x)

The application was designed specifically with an abstraction layer in `src/api/` that mirrors standard REST HTTP endpoints.

### Step 1: Update `src/api/client.js`
Replace the `localStorage` helpers with a standard `fetch` wrapper targeting your Flask backend:

```javascript
// src/api/client.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('linkhub_token');
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'API request failed');
  }

  return res.json();
}
```

### Step 2: Swap Service Implementations
Because `src/api/*Api.js` functions return standard Promises (`authApi.login`, `linksApi.getLinks`, `tasksApi.createTask`, etc.), simply change internal calls from `mockRequest(...)` to `request(...)`:

```javascript
// Example: src/api/linksApi.js with Flask REST API
import { request } from './client';

export const linksApi = {
  getLinks: (userId, params) => 
    request(`/links?${new URLSearchParams(params)}`),
    
  createLink: (data) => 
    request('/links', { method: 'POST', body: JSON.stringify(data) }),
    
  updateLink: (id, data) => 
    request(`/links/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    
  deleteLink: (id) => 
    request(`/links/${id}`, { method: 'DELETE' }),
    
  toggleStar: (id) => 
    request(`/links/${id}/star`, { method: 'PATCH' }),
    
  togglePin: (id) => 
    request(`/links/${id}/pin`, { method: 'PATCH' }),
    
  clickLink: (id) => 
    request(`/links/${id}/click`, { method: 'POST' }),
};
```

No UI components or hooks need to be rewritten when transitioning to Flask!

---

## 📱 Mobile Responsiveness & Accessibility
- **Breakpoints:** Responsive down to 390px viewports. Below 900px, the desktop sidebar converts to a fixed bottom navigation tab bar with accessible **44px touch tap targets**.
- **WCAG AA Contrast:** Validated across all 4 themes.
- **Accessible Controls:** Form inputs use explicit `<label>` bindings, dialogs include ARIA landmarks and Escape-key dismiss, and all interactive buttons feature visible focus rings.
