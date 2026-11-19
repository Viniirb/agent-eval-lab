**Nível:** Avançado  
**Validação automática:** `scripts/validate-module.sh 13` (o mesmo que o GitHub Actions roda no seu PR)

## Por que importa para avaliar agentes

Benchmark só ajuda se roda sempre e barra regressões. Mas agentes reais custam dinheiro e usam segredos: o cuidado é parte do trabalho.

## Leia antes

- docs/CONCEITOS.md seção 8
- .github/workflows/modules.yml (exemplo de workflow)

## Tarefas

- [ ] `parseSummary`: validar um `summary.json`
- [ ] `evaluateGate`: razões de falha (mínimo, runs, queda da média, tarefa ausente, queda por tarefa); queda igual ao limite é permitida
- [ ] Criar `.github/workflows/benchmark.yml` SEU: `workflow_dispatch`, `permissions` mínimas, uso de `secrets.`, upload dos resultados; sem `pull_request_target`

## Arquivos

- `src/gate/gate.ts`
- `.github/workflows/benchmark.yml (seu)`

## Critério de pronto

- [ ] `scripts/validate-module.sh 13` termina com "✔ Módulo 13 concluído."
- [ ] Nenhum `todo('M13', ...)` restante
- [ ] PR aberto com `Closes #<número desta issue>` e check **Validar módulo** verde

## Desafio extra (opcional)

- Faça o workflow comparar com a linha de base guardada em uma branch e falhar quando `evaluateGate` disser que não passa.

## Como entregar

```bash
git switch -c modulo/13-ci-gate
npx vitest run tests/m13-*.test.ts   # um teste por vez, leia a falha inteira
scripts/validate-module.sh 13
git push -u origin modulo/13-ci-gate
# abra o PR para a main com Closes #N
```

> Travou? `docs/FLUXO.md`. A solução completa está na branch `reference` (consulte só depois de tentar).
