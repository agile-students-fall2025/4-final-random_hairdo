# Contributing to SmartFit

Thank you for your interest in contributing to SmartFit! This document outlines our team's values, processes, and guidelines for contributing to the project.

---

## Table of Contents

- [Team Norms](#team-norms)
  - [Team Values](#team-values)
  - [Sprint Cadence](#sprint-cadence)
  - [Daily Standups](#daily-standup-meetings)
  - [Coding Standards](#coding-standards)
- [Git Workflow](#git-workflow)
- [Rules of Contributing](#rules-of-contributing)
- [Development Environment Setup](#development-environment-setup)
- [Building and Testing](#building-and-testing)
- [Code of Conduct](#code-of-conduct)

---

## Team Norms

### Team Values

Our team is committed to creating an inclusive, collaborative, and productive environment. We agree to the following principles:

#### Communication & Collaboration
- **Respect and Support**: We treat each other with respect and maintain a supportive atmosphere where everyone feels comfortable asking questions and sharing ideas.
- **Response Time**: Team members are expected to respond to messages directed at them within 24 hours during weekdays, 48 hours on weekends.
- **Help Protocol**: When stuck on a task for more than 2 hours, members should reach out in our team Discord #random_hairdo channel for assistance.
- **Availability**: We communicate our availability and time constraints proactively, especially during exam periods or when personal circumstances arise.

#### Accountability & Conflict Resolution
- **Individual Responsibility**: Each member is responsible for delivering on their commitments and communicating proactively if they cannot meet a deadline.
- **No Covering**: Team members will not cover for others who fail to participate or deliver. We address issues directly and constructively.
- **Escalation Process**: 
  1. If a member makes no progress on a task for two consecutive standups, the team will discuss it directly with that member.
  2. If the issue persists, the Scrum Master will escalate to the Product Owner or course instructor.
- **Conflict Resolution**: Disagreements on technical direction will be resolved through:
  1. Open discussion in team meetings
  2. Review of technical merits and project goals
  3. Voting if consensus cannot be reached (simple majority)
  4. Product Owner has final decision if team remains deadlocked

#### Work Philosophy
- **Quality Over Speed**: We prioritize well-tested, maintainable code over rushing to meet arbitrary deadlines.
- **Iterative Development**: We embrace the agile principle of building incrementally—get something working end-to-end first, then improve.
- **Continuous Learning**: We view mistakes as learning opportunities and support each other's growth as developers.

---

### Sprint Cadence

- **Sprint Duration**: 2 weeks
- **Sprint Planning**: First Monday of each sprint, 1-2 hours
- **Sprint Review**: Last Friday of each sprint, 1 hour
- **Sprint Retrospective**: Last Friday of each sprint, immediately following review, 30-45 minutes
- **Story Point Estimation**: We use planning poker with Fibonacci sequence (1, 2, 3, 5, 8, 13)

---

### Daily Standup Meetings

- **Schedule**: Monday, Wednesday, Friday at 6:00 PM EST via Zoom
- **Duration**: 15 minutes maximum (strictly enforced with a timer)
- **Format**: Each member answers three questions:
  1. What did I accomplish since the last standup?
  2. What am I working on until the next standup?
  3. What blockers or challenges am I facing?
- **Attendance**: 
  - Synchronous attendance is expected for all standups
  - If unable to attend, members must post their standup update in Slack **before** the meeting
  - Missing two consecutive standups without communication will trigger team discussion
- **Blocker Resolution**: Blockers identified in standup are addressed immediately after the meeting by relevant team members

---

### Coding Standards

#### Development Environment
- **Code Editor**: VS Code (for consistent formatting)

#### Code Quality Principles
- **Don't Over-Engineer**: Write the minimum code needed to get features working end-to-end, then iterate to improve
- **Self-Documenting Code**: 
  - Use descriptive variable and function names (`getUserWorkoutHistory` not `getUWH`)
  - Avoid unnecessary abbreviations
  - Write clear, readable code that explains itself
- **Comments**: 
  - Use comments to explain *why*, not *what*
  - Complex algorithms should have brief explanations
  - Remove TODO comments before merging
- **No Dead Code**: Delete commented-out code or unused imports immediately
- **Small Commits**: Make granular commits per feature or bug fix
- **Descriptive Commit Messages**: Follow conventional commits format (see Git Workflow section)

#### Testing Requirements
- **Code Coverage**: All new features must include unit tests
- **Integration Tests**: Critical user flows must have integration tests
- **Test Before Merge**: All tests must pass before creating a pull request
- **Testing Philosophy**: Write tests that provide value, not just to increase coverage percentages

#### Code Review Standards
- **Peer Review Required**: All code must be reviewed by at least one other team member before merging
- **Review Checklist**:
  - Does the code solve the intended problem?
  - Is it readable and maintainable?
  - Are there adequate tests?
  - Does it follow our coding standards?
  - Are there any security concerns?
- **Pipeline Protection**: Never merge code that breaks the build. If you break the pipeline, fix it immediately as your top priority

---

## Git Workflow
Default branch: 'master'

- Work on your own branch named **<yourname>**. Do not commit directly to 'master'
- Commit messages: **one line**, meaningful and concise (changes and reason for changes)
- Open a pull request to 'master'. At least one peer review is required before merging.

**Steps**
```bash

# update local master
git checkout master
git pull origin master

# create your branch
git check -b <yourname>

# stage and commit (one-line message)
git add .
git commit -m "meaningful one-line message"

# push your branch and open a PR to master
git push origin <yourname>