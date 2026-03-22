# Tech Stack

## Phase 1 (Web)
| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19 |
| Language | TypeScript | 5.x (strict) |
| Build | Vite | 7 |
| Styling | Tailwind CSS + CSS Variables | 4 |
| State (UI) | Zustand | 5 |
| State (Server) | TanStack React Query | 5 |
| Routing | React Router DOM | 7 |
| Backend | Supabase (Postgres, Auth, Realtime) | latest |
| Validation | Zod | 4 |
| Dates | date-fns | 4 |
| DnD | @dnd-kit/core + @dnd-kit/sortable | 6/10 |
| Linting | Biome | 2 |

## Phase 2 (Desktop)
| Layer | Technology |
|-------|-----------|
| Shell | Tauri v2 |
| Local DB | SQLite (via Tauri plugin) |
| Notifications | Native OS (via Tauri) |

## Phase 4 (Mobile)
| Layer | Technology |
|-------|-----------|
| Framework | React Native (Expo) |
| Navigation | React Navigation |
| Storage | SQLite (expo-sqlite) |

## Why These Choices
- **Tauri over Electron**: 10MB binary vs 150MB+. 30MB RAM vs 150MB+. Rust backend. React frontend drops in directly.
- **Separate habits table**: Habits have fundamentally different UX (binary, streaks, indefinite) vs actions (numeric, deadline-bound).
- **CSS variables + Tailwind**: Variables for runtime theming and design tokens. Tailwind for layout utilities. Both coexist.
- **No monorepo yet**: Single web app, single developer. Convert to monorepo when adding Tauri/RN.
- **Supabase Edge Functions for AI**: Claude API calls proxied through Edge Functions. Keeps API keys server-side.
