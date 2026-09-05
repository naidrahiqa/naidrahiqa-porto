# AGENTS.md — naidra

## Team Registry

| Role | Skill ID | Skill File | Assigned Triggers | Status |
|------|----------|------------|-------------------|--------|
| **Code Optimizer** | `ponytail` | `skills/ponytail/AGENTS.md` | Minimal code, YAGNI, reuse existing | Active |
| **Knowledge Graph** | `graphify` | `skills/graphify/AGENTS.md` | Map codebase to knowledge graph | Active |
| **Skills Collection** | `awesome-claude-skills` | `skills/awesome-claude-skills/README.md` | Browse 1000+ available skills | Active |
| **Vercel Optimizer** | `agent-skills` | `skills/agent-skills/AGENTS.md` | Vercel optimize, React best practices, web design | Active |

---

## Available Skills

### Skill: Ponytail (Code Optimizer)
- **ID**: `ponytail`
- **File**: `skills/ponytail/AGENTS.md`
- **Responsibility**: Write minimal, efficient code - lazy senior dev mode
- **Triggers**: `write_code`, `refactor`, `optimize`, `manual_request`
- **Input Type**: `code-context`, `task-description`
- **Output Type**: `code`, `diff`
- **Dependencies**: None
- **Estimated Runtime**: ~5-30 seconds
- **Severity Levels**: `medium` (code quality)
- **Owner Role**: Code Optimizer

**Details**:
- YAGNI principle: question if code needs to be built at all
- Reuse existing helpers, utils, patterns in codebase
- Use stdlib and native platform features first
- Shortest working diff wins
- No abstractions not explicitly requested
- No new dependencies if avoidable
- Deletion over addition, boring over clever

---

### Skill: Graphify (Knowledge Graph)
- **ID**: `graphify`
- **File**: `skills/graphify/AGENTS.md`
- **Responsibility**: Map project code/docs into queryable knowledge graph
- **Triggers**: `map_codebase`, `understand_architecture`, `find_connections`, `manual_request`
- **Input Type**: `directory` (project root)
- **Output Type**: `graph.json`, `graph.html`, `GRAPH_REPORT.md`
- **Dependencies**: None
- **Estimated Runtime**: ~30-120 seconds
- **Severity Levels**: `low` (informational)
- **Owner Role**: Knowledge Graph

**Details**:
- Code parsed with tree-sitter AST (deterministic, no LLM)
- Every edge tagged EXTRACTED or INFERRED
- Not a vector index - real graph you traverse
- Output: graph.html (interactive), GRAPH_REPORT.md (highlights), graph.json (queryable)
- Run `graphify update .` after code changes to keep graph current

---

### Skill: Awesome Claude Skills (Skills Collection)
- **ID**: `awesome-claude-skills`
- **File**: `skills/awesome-claude-skills/README.md`
- **Responsibility**: Browse and discover 1000+ available skills and plugins
- **Triggers**: `find_skill`, `browse_skills`, `manual_request`
- **Input Type**: `query` (skill category or name)
- **Output Type**: `markdown` (skill recommendations)
- **Dependencies**: None
- **Estimated Runtime**: ~5-10 seconds
- **Severity Levels**: `low` (informational)
- **Owner Role**: Skills Collection

**Details**:
- Curated list of production-ready Claude Skills and plugins
- Categories: coding, productivity, integrations, and more
- Includes Composio MCP Gateway for 1000+ app integrations
- Reference for discovering new capabilities

---

### Skill: Agent Skills (Vercel Optimizer)
- **ID**: `agent-skills`
- **File**: `skills/agent-skills/AGENTS.md`
- **Responsibility**: Vercel project optimization, React best practices, web design guidelines
- **Triggers**: `optimize_vercel`, `review_react`, `audit_ui`, `manual_request`
- **Input Type**: `directory` (project root), `cli-args` (skill choice)
- **Output Type**: `markdown` (audit report), `json` (metrics)
- **Dependencies**: None
- **Estimated Runtime**: ~30-60 seconds
- **Severity Levels**: `medium` (optimization), `high` (critical issues)
- **Owner Role**: Vercel Optimizer

**Details**:
- **vercel-optimize**: Audit Vercel project for cost, performance, reliability
- **react-best-practices**: 40+ rules across 8 categories for React/Next.js
- **web-design-guidelines**: 100+ rules for accessibility, performance, UX
- **writing-guidelines**: 80+ rules for docs and prose compliance

---

## Workflow Definitions

### Workflow 1: Code Review with Ponytail
**ID**: `code-review`
**Trigger**: User says "review code", "optimize this", "make it simpler"
**Type**: Single skill

```yaml
steps:
  - step_id: review
    skill_id: ponytail
    condition: always
    on_failure: notify_only
    parameters:
      mode: review

output_action: "Print optimization suggestions"
estimated_duration: ~10-30 seconds
```

---

### Workflow 2: Map Codebase with Graphify
**ID**: `map-codebase`
**Trigger**: User says "map this project", "show architecture", "understand codebase"
**Type**: Single skill

```yaml
steps:
  - step_id: graph
    skill_id: graphify
    condition: always
    on_failure: notify_only
    parameters:
      path: "."

output_action: "Print graph.html location + GRAPH_REPORT.md summary"
estimated_duration: ~30-120 seconds
```

---

### Workflow 3: Full Project Audit
**ID**: `project-audit`
**Trigger**: User says "audit project", "full review", "check everything"
**Type**: Parallel (run multiple skills at once)

```yaml
steps:
  - step_id: vercel-audit
    skill_id: agent-skills (vercel-optimize)
    condition: always
    on_failure: notify_only

  - step_id: react-review
    skill_id: agent-skills (react-best-practices)
    condition: always
    on_failure: notify_only

  - step_id: ui-audit
    skill_id: agent-skills (web-design-guidelines)
    condition: always
    on_failure: notify_only

  - step_id: code-review
    skill_id: ponytail
    condition: always
    on_failure: notify_only

output_action: "Print combined audit report"
estimated_duration: ~60-180 seconds
```

---

## Skill Routing Logic

### Event-Based Routing

```yaml
triggers:
  "write_code":
    - skills: [ponytail]
      parallel: false
      on_failure: notify_only
    - description: "Write minimal, efficient code"

  "optimize_code":
    - skills: [ponytail]
      parallel: false
      on_failure: notify_only
    - description: "Refactor to minimal solution"

  "map_codebase":
    - skills: [graphify]
      parallel: false
      on_failure: notify_only
    - description: "Map project to knowledge graph"

  "find_skill":
    - skills: [awesome-claude-skills]
      parallel: false
      on_failure: notify_only
    - description: "Browse available skills"

  "optimize_vercel":
    - skills: [agent-skills]
      parallel: false
      on_failure: notify_only
    - description: "Audit Vercel project"

  "review_react":
    - skills: [agent-skills]
      parallel: false
      on_failure: notify_only
    - description: "React best practices review"

  "audit_ui":
    - skills: [agent-skills]
      parallel: false
      on_failure: notify_only
    - description: "Web design guidelines audit"
```

### Context-Based Routing

| Context | Skill(s) | Rationale |
|---------|----------|-----------|
| User mentions "simplify", "minimize", "less code" | `ponytail` | Code optimization context |
| User mentions "architecture", "map", "connections" | `graphify` | Codebase mapping context |
| User mentions "skills", "plugins", "extensions" | `awesome-claude-skills` | Skill discovery context |
| User mentions "vercel", "deploy", "serverless" | `agent-skills` (vercel-optimize) | Vercel optimization context |
| User mentions "react", "nextjs", "components" | `agent-skills` (react-best-practices) | React review context |
| User mentions "ui", "accessibility", "design" | `agent-skills` (web-design-guidelines) | UI audit context |

### Severity-Based Routing

| Severity | Action | Escalation |
|----------|--------|------------|
| **Critical** (build error, security issue) | HALT immediately | Notify user with exact error |
| **High** (performance issue, missing config) | Continue with warning | Log + notify user |
| **Medium** (optimization suggestion) | Continue silently | Include in summary report |
| **Low** (style, non-critical) | Continue silently | Add to end-of-run report |

---

## CLI Interface

### Manual Skill Invocation

```bash
# Run individual skills
opencode-agent run ponytail --path . --mode review
opencode-agent run graphify --path . --update
opencode-agent run agent-skills --path . --skill vercel-optimize

# Run with custom parameters
opencode-agent run ponytail \
  --path . \
  --diff-only \
  --output-dir out

# Run with flags
opencode-agent run graphify --path . --output-dir graphify-out
opencode-agent run agent-skills --path . --skill react-best-practices
```

### Workflow Invocation

```bash
# Run code review workflow
opencode-agent workflow run code-review --path .

# Run codebase mapping workflow
opencode-agent workflow run map-codebase --path .

# Run full project audit
opencode-agent workflow run project-audit --path .

# Dry-run (show what would happen without executing)
opencode-agent workflow run project-audit --dry-run
```

### Info & Status Commands

```bash
# List available skills
opencode-agent skills list

# Show skill details
opencode-agent skills info ponytail
opencode-agent skills info graphify
opencode-agent skills info agent-skills

# List available workflows
opencode-agent workflows list

# Show workflow details
opencode-agent workflow info code-review
opencode-agent workflow info map-codebase
opencode-agent workflow info project-audit

# Validate AGENTS.md structure
opencode-agent validate-agents
```

---

## Configuration

### workflow-config.yaml

```yaml
# naidra Workflow Configuration
team:
  name: "naidra"
  project: "naidra"

skills:
  ponytail:
    mode: "review"  # review, optimize, refactor
    diff_only: false
    timeout_seconds: 30

  graphify:
    output_dir: "graphify-out"
    update_on_change: true
    timeout_seconds: 120

  agent-skills:
    skills:
      - vercel-optimize
      - react-best-practices
      - web-design-guidelines
      - writing-guidelines
    timeout_seconds: 60

workflows:
  code-review:
    enabled: true
    strict_mode: false
    auto_commit: false

  map-codebase:
    enabled: true
    strict_mode: false
    update_on_change: true

  project-audit:
    enabled: true
    strict_mode: false
    parallel_skills: 4

notifications:
  default_channels: ["console"]
  include_build_log: true
  include_artifacts: true

defaults:
  timeout_seconds: 600
  retry_count: 1
  log_level: "info"
```

---

## Material Reference

| Component | Repository | Version/Ref |
|-----------|------------|-------------|
| **Ponytail** | `DietrichGebert/ponytail` | Latest (code optimizer) |
| **Graphify** | `Graphify-Labs/graphify` | Latest (knowledge graph) |
| **Awesome Claude Skills** | `ComposioHQ/awesome-claude-skills` | Latest (skill collection) |
| **Agent Skills** | `vercel-labs/agent-skills` | Latest (Vercel optimizer) |
