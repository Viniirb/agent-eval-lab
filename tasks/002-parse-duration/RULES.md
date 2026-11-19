# Rules for this task

Follow these project rules. They are checked automatically.

```json
[
  {
    "id": "RULE-001",
    "kind": "forbidden-pattern",
    "pattern": "console\\.(log|debug|info)",
    "paths": ["src/**"],
    "message": "Library code must not print to the console."
  },
  {
    "id": "RULE-002",
    "kind": "forbidden-pattern",
    "pattern": ":\\s*any\\b|\\bas any\\b",
    "paths": ["src/**"],
    "message": "Do not use the any type."
  },
  {
    "id": "RULE-003",
    "kind": "required-file",
    "path": "README.md",
    "message": "The library needs a README.md."
  },
  {
    "id": "RULE-004",
    "kind": "import-boundary",
    "from": "src/**",
    "disallow": "^node:|^[a-z@]",
    "message": "The library must have zero dependencies: only relative imports."
  }
]
```
