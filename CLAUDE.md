# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

製造業向け勤怠管理システム - Manufacturing Industry Attendance Management System

A comprehensive attendance and workforce management system designed specifically for manufacturing companies, featuring NFC card authentication, shift management, overtime tracking, and compliance with Japanese labor laws.

## System Requirements

### User Roles
- **Employee (従業員)**: Clock in/out, view own attendance, request corrections
- **Manager (管理者)**: Approve requests, view team attendance, manage shifts
- **Admin (システム管理者)**: Full system access, user management, system configuration

### Key Features
1. **Multi-method Time Recording**:
   - NFC card readers at factory entrances
   - Web/mobile clock in/out with authentication
   - Support for remote work considerations

2. **Locations/Departments**:
   - 第一工場 (Factory 1)
   - 第二工場 (Factory 2)
   - 第三工場 (Factory 3)
   - プレス (Press)
   - 溶接 (Welding)
   - 間接部門 (Indirect/Office)

3. **Labor Law Compliance (労働基準法準拠)**:
   - Standard hours: 8 hours/day, 40 hours/week
   - Overtime limits: 45 hours/month, 360 hours/year
   - Special provisions: 720 hours/year, 80 hours multi-month average, <100 hours/month
   - Overtime rates: 25% (normal), 50% (>60 hours/month)
   - Late night work (22:00-5:00): 25% additional
   - Late night overtime: 50% (25% + 25%)

4. **Management Features**:
   - Real-time attendance dashboard
   - Automatic detection: late arrivals, early departures, absences
   - Monthly closing processes
   - CSV export for payroll integration
   - Skill/qualification management
   - Fatigue and safety management

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Start production server:
   ```bash
   npm start
   ```

## Common Commands

- `npm run dev` - Start development server (default: http://localhost:3000)
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run lint` - Run linting (if configured)
- `npm run typecheck` - Run TypeScript type checking (when configured)

## Architecture

### Current Stack (MVP)
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom color palette
- **State Management**: React useState hooks
- **Data Persistence**: localStorage (temporary, will migrate to database)

### Planned Stack (Full System)
- **Backend**: Node.js with Express/Fastify
- **Database**: PostgreSQL with TimescaleDB for time-series data
- **Cache**: Redis for sessions and real-time data
- **Authentication**: JWT with refresh tokens
- **NFC Integration**: Web NFC API or dedicated middleware
- **Deployment**: Cloud (AWS/Azure/GCP) or hybrid

### Project Structure
```
/app                 - Next.js App Router pages
/components          - Reusable React components
/lib                 - Utility functions and helpers
/types              - TypeScript type definitions
/api                - API routes (when implemented)
/docs               - System documentation
  - requirements.md  - Full requirements specification
  - database-design.md - Database schema design
  - system-architecture.md - System architecture details
/public             - Static assets
```

## Design Guidelines

### Color Palette
#### Base/Main Colors
- **Background (Base)**: Platinum `#E0E1DD`
- **Header/Footer/Navigation**: Oxford Blue `#1B263B`
- **Primary Button**: YInMn Blue `#415A77`

#### Secondary/Accent Colors
- **Secondary Button/Card Border/Form Border**: Silver Lake Blue `#778DA9`
- **Accent Color (Important Actions/Emphasis)**: Sunset Orange `#F4A261`

#### Text Colors
- **Headings**: Rich Black `#0D1B2A`
- **Body Text**: Oxford Blue `#1B263B`
- **Sub Text/Helper Info**: Silver Lake Blue `#778DA9`
- **Links**: YInMn Blue `#415A77` (with orange underline on hover)

#### State Colors
- **Success (Approved/Clocked In)**: Green `#4CAF50`
- **Warning (Attention Required)**: Yellow `#FFD166`
- **Error (Clock Error/Invalid)**: Red `#E63946`

### Color Usage Rules
1. **White Background × Blue Hierarchy × Orange Accent** as the 3-layer structure foundation
2. Accent color (orange) should only be used for important operations and emphasis
3. Text and background contrast ratio must meet 4.5:1 or higher
4. For dark mode implementation, use darker blue tones, orange can be used commonly

### UI/UX Principles
- Clean, professional, modern aesthetic
- Clear visual feedback for all actions
- Responsive design for desktop and mobile
- Accessibility compliant (WCAG 2.1 AA)

## Data Models (Planned)

### Core Entities
- **Users**: Employee information, authentication
- **TimeRecords**: Individual clock in/out events
- **AttendanceDaily**: Aggregated daily attendance
- **Shifts**: Shift patterns and assignments
- **Departments**: Organizational structure
- **Requests**: Leave, overtime, correction requests
- **Qualifications**: Skills and certifications

## Development Phases

### Phase 1: MVP (Current)
- Basic clock in/out functionality
- Simple attendance display
- LocalStorage persistence

### Phase 2: Core Features
- User authentication
- Database integration
- Manager approval workflows
- Basic reporting

### Phase 3: Advanced Features
- NFC card integration
- Shift management
- Comprehensive labor law calculations
- Advanced analytics and reporting

### Phase 4: Enterprise Features
- Multi-location support
- Integration with payroll systems
- Mobile applications
- Advanced safety management

## Important Considerations

1. **Security**: All personal data must be encrypted and handled according to privacy laws
2. **Compliance**: System must comply with Japanese Labor Standards Act (労働基準法)
3. **Performance**: Must handle concurrent access from 1000+ users
4. **Reliability**: 99.5% uptime requirement for production use
5. **Audit Trail**: All changes must be logged for compliance

## Testing Strategy

- Unit tests for business logic (labor law calculations)
- Integration tests for API endpoints
- E2E tests for critical user flows
- Load testing for concurrent users
- Security testing for authentication/authorization

## Notes for Development

- Always validate time calculations against labor law requirements
- Ensure proper timezone handling (JST)
- Implement proper error handling and user feedback
- Follow accessibility guidelines for factory floor usage
- Consider offline capability for network issues

## Task Management

### Ticket Files
Development tasks are organized as numbered markdown files in `/docs` directory:
- 001-authentication-user-management.md
- 002-time-recording.md
- 003-attendance-management.md
- 004-shift-management.md
- 005-admin-dashboard.md
- 006-report-export.md
- 007-qualification-management.md
- 008-health-safety-management.md
- 009-notification-alert.md
- 010-system-integration.md
- 011-mobile-app.md
- 012-system-admin.md

### Todo Checkbox Format
Each ticket file contains checkboxes for task tracking:
- `- [ ]` : Pending task (not started)
- `- [x]` : Completed task (finished)

When completing a task, change `- [ ]` to `- [x]` in the relevant ticket file.

### Priority Levels
- **High**: Core functionality, must be implemented first
- **Medium**: Important features for production use
- **Low**: Nice-to-have features, can be deferred

### Development Phases
- **Phase 1 (MVP)**: Tickets 001, 002, 003, 005, 006
- **Phase 2**: Tickets 004, 007, 008, 009
- **Phase 3**: Tickets 010, 012
- **Phase 4**: Ticket 011