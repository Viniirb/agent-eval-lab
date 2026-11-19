# agent-eval-lab

Construa, módulo a módulo, um **harness que mede o quanto um agente de código (Claude Code, Codex, ou qualquer outro)
cumpre uma tarefa**: segue a spec, entrega todas as funcionalidades, respeita as regras e os padrões do projeto, e fica
dentro do escopo. No fim, você terá um benchmark seu, validado, e dados reais para decidir *qual* agente, *qual* prompt e
*quais* regras funcionam melhor no seu projeto.

## A ideia em uma imagem

```
tarefa (SPEC + RULES + testes de aceitação) ──► agente trabalha numa cópia isolada
                                                      │
        arquivos alterados ◄──────────────────────────┘
              │
              ├─ testes de aceitação por requisito ──► funcional  (60%)
              ├─ verificadores de regras e padrões ──► regras     (20%)
              ├─ guarda de escopo / arquivos protegidos ► escopo   (10%)
              └─ typecheck ─────────────────────────► qualidade   (10%)
                                                      │
                                              nota 0..100 + nota A..F
```

## Como funciona o estudo

- **17 módulos** (00 a 16), cada um uma **issue** (issue #N = módulo N-1).
- Cada módulo tem **testes que já existem e começam falhando**. Você troca os `todo('MNN', ...)` por código até ficarem verdes.
- Entrega por **branch + PR** (`modulo/NN-nome`, `Closes #N`). O **GitHub Actions** valida o módulo; ele também **recusa** PR que
  altere testes existentes, scripts ou workflows (seria trapacear no próprio benchmark).
- A solução completa está na branch **`reference`**. Consulte só depois de tentar.
- Texto de apoio: [`docs/CONCEITOS.md`](docs/CONCEITOS.md). Fluxo: [`docs/FLUXO.md`](docs/FLUXO.md).

## Trilha

| # | Módulo | Nível | O que você constrói |
|---|--------|-------|---------------------|
| 00 | Setup e hipóteses | Básico | Ambiente e 3 hipóteses sobre agentes |
| 01 | Specs que um agente consegue seguir | Básico | Parser de SPEC com IDs e MUST/SHOULD/MAY |
| 02 | Regras e padrões como dados | Básico | Parser e validação de RULES (JSON) |
| 03 | Testes de aceitação por requisito | Básico | Cobertura de requisitos pelos testes |
| 04 | Verificadores de regras e globs | Intermediário | Glob, padrões proibidos, fronteiras de import |
| 05 | Guarda de escopo | Intermediário | Detectar arquivos fora do escopo/protegidos |
| 06 | Pontuação | Intermediário | Nota ponderada, tetos e conceitos |
| 07 | Sandbox isolado | Intermediário | Cópia isolada, snapshot, diff, execução com timeout |
| 08 | Adaptadores de agente | Intermediário | Invocar CLIs sem shell, agente falso determinístico |
| 09 | Relatórios | Intermediário | Tabelas comparativas por agente e tarefa |
| 10 | Validar o benchmark | Avançado | Golden e mutantes: "quem testa os testes?" |
| 11 | Criando uma tarefa completa | Avançado | Seu próprio caso de teste (tarefa 002) |
| 12 | Experimentos A/B | Avançado | Estatística para comparar condições |
| 13 | CI e portão de regressão | Avançado | Workflow manual + critério de falha |
| 14 | Segurança: trapaça e injeção | Avançado | Detectar burlas e instruções escondidas |
| 15 | Pipeline ponta a ponta | Avançado | Tudo junto, com vitest e tsc de verdade |
| 16 | Experimento real e relatório | Avançado | Agentes reais, 3+ rodadas, achados escritos |

## Comece aqui

```bash
npm ci
npm test                       # vermelho: é o ponto de partida
scripts/validate-module.sh 00  # falha até você escrever docs/HIPOTESES.md
```

Depois abra a issue #1 (módulo 00).

## Estrutura

```
src/        seu código (um arquivo por módulo)  ·  types.ts já pronto  ·  cli.ts pronto
tests/      a "régua" de cada módulo (não altere)
tasks/      tarefas avaliadas: 001 pronta; a 002 é sua (módulo 11)
docs/       CONCEITOS, FLUXO, issues/, HIPOTESES (sua), FINDINGS (sua)
scripts/    validate-module.sh, progress.sh
```

## Usando o harness (depois dos módulos)

```bash
npm run bench -- lint tasks/001-rate-limiter
npm run bench -- run tasks/001-rate-limiter fake-golden          # agente falso (grátis)
npm run bench -- run tasks/001-rate-limiter claude-code --agents agents.json --runs 3
npm run bench -- report results/runs.json
```

Crie `agents.json` a partir de `agents.example.json` e **confira as flags na documentação atual de cada CLI**: elas mudam.
