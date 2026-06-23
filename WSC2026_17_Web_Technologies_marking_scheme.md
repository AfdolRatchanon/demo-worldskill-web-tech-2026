# WSC2026 – Web Technologies Marking Scheme

## WSOS Sections

| Section | Area | Marks |
|----------|----------|----------:|
| 1 | Backend API | 40 |
| 2 | Frontend UX/UI | 25 |
| 3 | Integration and Business Rules | 20 |
| 4 | Deployment in LAN | 10 |
| 5 | Code Quality and Maintainability | 5 |
| **Total** |  | **100** |

---

## Criterion A – Backend API (40 Marks)

| ID | Sub-Criterion | Type | Description | Requirement | Marks |
|----|----|----|----|----|----:|
| A1 | Authentication and Authorization | M | Successful login and logout flow works correctly | POST /api/login, POST /api/logout | 2 |
| A1 | Authentication and Authorization | M | Protected endpoints reject unauthenticated requests | 401 handling | 2 |
| A1 | Authentication and Authorization | M | Role-based access control | Candidate/Judge/Manager roles | 4 |
| A1 | Authentication and Authorization | J | Authentication handling is coherent and secure | - | 2 |
| A2 | Candidate APIs | M | GET /api/tasks | Current candidate tasks | 1 |
| A2 | Candidate APIs | M | GET /api/my-result | Candidate results | 1 |
| A2 | Candidate APIs | M | GET /api/my-submission | Submission retrieval | 1.5 |
| A2 | Candidate APIs | M | POST /api/my-submission | Submission creation | 1.5 |
| A2 | Candidate APIs | M | PUT /api/my-submission | Submission update | 1.5 |
| A2 | Candidate APIs | J | API design and validation messages | - | 1.5 |
| A3 | Judge and Manager APIs | M | GET /api/candidates | Candidate list | 1 |
| A3 | Judge and Manager APIs | M | GET /api/submissions | Submission list | 1 |
| A3 | Judge and Manager APIs | M | PUT /api/session/start | Start session | 1.5 |
| A3 | Judge and Manager APIs | M | PUT /api/session/close | Close session | 1.5 |
| A3 | Judge and Manager APIs | M | POST /api/submissions/{id}/recheck | Recheck | 1.5 |
| A3 | Judge and Manager APIs | M | PUT /api/results/{candidate_id}/confirm | Confirm result | 1.5 |
| A3 | Judge and Manager APIs | M | GET /api/statistics/summary | Summary metrics | 2 |
| A3 | Judge and Manager APIs | M | GET /ranking | Ranking | 2 |
| A3 | Judge and Manager APIs | M | GET /status | Pass/Fail | 2 |
| A3 | Judge and Manager APIs | M | GET /report | Export report | 2 |
| A3 | Judge and Manager APIs | J | API organization | - | 2 |
| A4 | API Quality | M | Status codes and error schema consistency | Standard responses | 2 |
| A4 | API Quality | J | API structure and schema consistency | - | 2 |

---

## Criterion B – Frontend UX/UI (25 Marks)

| ID | Type | Description | Marks |
|----|----|----|----:|
| B1 | M | Login validation and role redirect | 1.5 |
| B1 | J | Login UX and feedback quality | 2 |
| B2 | M | Candidate dashboard timer/session/task display | 1.5 |
| B2 | M | Submission form create/update | 2 |
| B2 | J | Dashboard usability and accessibility | 2 |
| B3 | M | Candidate list and submission table | 2 |
| B3 | M | Session control, recheck, confirm actions | 3 |
| B3 | J | Judge workflow efficiency | 3 |
| B4 | M | Summary, ranking, pass/fail display | 4 |
| B4 | J | Reporting clarity | 3 |
| B5 | M | Responsive layout | 1 |

---

## Criterion C – Integration & Business Rules (20 Marks)

| ID | Type | Description | Marks |
|----|----|----|----:|
| C1 | M | No submission before session start | 2 |
| C1 | M | No submission after session close | 2 |
| C2 | M | One active submission per candidate | 3 |
| C2 | M | Candidate only accesses own data | 3 |
| C2 | M | LAN URL validation | 3 |
| C3 | M | Recheck flow correctness | 2 |
| C3 | M | Confirm flow correctness | 2 |
| C3 | J | Workflow coherence and dependability | 3 |

---

## Criterion D – Deployment in LAN (10 Marks)

| ID | Type | Description | Marks |
|----|----|----|----:|
| D1 | M | Frontend URL reachable in LAN | 3 |
| D1 | M | Backend API reachable in LAN | 3 |
| D2 | M | Offline LAN compliance | 3 |
| D2 | J | Stable deployment package | 1 |

---

## Criterion E – Code Quality & Maintainability (5 Marks)

| ID | Type | Description | Marks |
|----|----|----|----:|
| E1 | J | Code structure, naming, separation of concerns | 3 |
| E2 | J | Maintainability and handover readiness | 2 |

