**Nível:** Avançado  
**Validação automática:** `scripts/validate-module.sh 15` (o mesmo que o GitHub Actions roda no seu PR)

## Por que importa para avaliar agentes

Agora tudo se encontra: uma rodada completa, com vitest e tsc de verdade, em uma cópia isolada.

## Leia antes

- Todos os módulos anteriores
- src/cli.ts (já pronto, usa o pipeline)

## Tarefas

- [ ] `parseVitestJson` e `countTypeErrors`
- [ ] `runBenchmark`: preparar, copiar SPEC/RULES, snapshot, rodar o agente, snapshot, diff, escopo, vitest (JSON), tsc, regras, cobertura, nota
- [ ] `listTasks`
- [ ] Rodar `npm run bench -- run tasks/001-rate-limiter fake-golden` (deve dar 100)

## Arquivos

- `src/pipeline/pipeline.ts`

## Critério de pronto

- [ ] `scripts/validate-module.sh 15` termina com "✔ Módulo 15 concluído."
- [ ] Nenhum `todo('M15', ...)` restante
- [ ] PR aberto com `Closes #<número desta issue>` e check **Validar módulo** verde

## Desafio extra (opcional)

- Rode as 3 variantes de mutante pela CLI e gere um relatório com `npm run bench -- report`.

## Como entregar

```bash
git switch -c modulo/15-pipeline
npx vitest run tests/m15-*.test.ts   # um teste por vez, leia a falha inteira
scripts/validate-module.sh 15
git push -u origin modulo/15-pipeline
# abra o PR para a main com Closes #N
```

> Travou? `docs/FLUXO.md`. A solução completa está na branch `reference` (consulte só depois de tentar).
