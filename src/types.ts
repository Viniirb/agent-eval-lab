// Shared types for the whole harness. They are given: you build the behavior around them.

// ── Specs (module 01) ────────────────────────────────────────────────────────────────────────
export type Level = 'MUST' | 'SHOULD' | 'MAY';

export interface Requirement {
  id: string; // "R1"
  level: Level;
  text: string;
}

// ── Rules (modules 02 and 04) ────────────────────────────────────────────────────────────────
interface RuleBase {
  id: string; // "RULE-001"
  message: string;
}

/** A line of text that must NOT appear in the files matched by `paths` (globs). `pattern` is a regex source. */
export interface ForbiddenPatternRule extends RuleBase {
  kind: 'forbidden-pattern';
  pattern: string;
  paths: string[];
}

/** A file that must exist (exact relative path). */
export interface RequiredFileRule extends RuleBase {
  kind: 'required-file';
  path: string;
}

/** Files matched by `from` (glob) must not import a specifier that matches `disallow` (regex source). */
export interface ImportBoundaryRule extends RuleBase {
  kind: 'import-boundary';
  from: string;
  disallow: string;
}

export type Rule = ForbiddenPatternRule | RequiredFileRule | ImportBoundaryRule;

export interface Violation {
  ruleId: string;
  message: string;
  path?: string;
  line?: number; // 1-based
}

// ── Scope (module 05) ────────────────────────────────────────────────────────────────────────
export type ChangeKind = 'added' | 'modified' | 'deleted';

export interface FileChange {
  path: string;
  kind: ChangeKind;
}

export interface ScopePolicy {
  allowed: string[]; // globs the agent may touch
  protected: string[]; // globs the agent must NEVER touch (tests, specs)
  maxFilesChanged?: number;
}

export interface ScopeReport {
  ok: boolean;
  outOfScope: string[];
  protectedTouched: string[];
  tooManyFiles: boolean;
}

// ── Acceptance results (module 03) ───────────────────────────────────────────────────────────
export interface TestResult {
  title: string; // may contain tags like [R1]
  status: 'passed' | 'failed' | 'skipped';
}

export interface RequirementCoverage {
  status: 'passed' | 'failed' | 'untested';
  total: number;
  passed: number;
}

export interface Coverage {
  perRequirement: Record<string, RequirementCoverage>;
  weighted: number; // 0..1
}

// ── Scoring (module 06) ──────────────────────────────────────────────────────────────────────
export interface ScoreInput {
  functional: number; // 0..1, from Coverage.weighted
  testsRan: boolean;
  rules: { violations: Violation[]; totalRules: number };
  scope: ScopeReport;
  quality: { typecheckErrors: number };
}

export interface Weights {
  functional: number;
  rules: number;
  scope: number;
  quality: number;
}

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface ScoreCard {
  total: number; // 0..100, one decimal
  grade: Grade;
  breakdown: { functional: number; rules: number; scope: number; quality: number }; // each 0..1
  capped?: string; // reason, when a cap lowered the total
}

// ── Sandbox and agents (modules 07 and 08) ───────────────────────────────────────────────────
export interface CommandResult {
  code: number;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  durationMs: number;
}

export interface AgentConfig {
  name: string;
  command: string;
  args: string[]; // may contain {{prompt}} and {{workdir}}
  timeoutMs: number;
  env?: Record<string, string>;
}

export interface Invocation {
  command: string;
  args: string[];
  cwd: string;
  env: Record<string, string>;
  timeoutMs: number;
}

// ── Tasks and runs (modules 09 to 15) ────────────────────────────────────────────────────────
export interface TaskConfig {
  id: string;
  title: string;
  prompt: string; // what the agent receives
  allowed: string[];
  protected: string[];
  maxFilesChanged?: number;
  testTimeoutMs?: number;
}

export interface RunResult {
  task: string;
  agent: string;
  run: number; // 1-based
  card: ScoreCard;
  durationMs: number;
}
