**Nível:** Básico  
**Validação automática:** `scripts/validate-module.sh 03` (o mesmo que o GitHub Actions roda no seu PR)

## Por que importa para avaliar agentes

A nota funcional precisa dizer QUAIS requisitos passaram. A ligação entre teste e requisito é a etiqueta `[R1]` no título.

## Leia antes

- docs/CONCEITOS.md seção 4
- tasks/001-rate-limiter/acceptance/rate-limiter.test.ts

## Tarefas

- [ ] `extractTags`: achar `[R1]`, `[R2]` no título (sem repetir)
- [ ] `requirementCoverage`: passa só se tem teste e TODOS passaram; skipped não conta; sem teste = `untested`
- [ ] `weighted`: peso dos requisitos que passaram / peso total (nunca NaN)

## Arquivos

- `src/acceptance/coverage.ts`

## Critério de pronto

- [ ] `scripts/validate-module.sh 03` termina com "✔ Módulo 03 concluído."
- [ ] Nenhum `todo('M03', ...)` restante
- [ ] PR aberto com `Closes #<número desta issue>` e check **Validar módulo** verde

## Desafio extra (opcional)

- Pense: um teste vale para dois requisitos. Isso é bom ou ruim para a análise de falhas?

## Como entregar

```bash
git switch -c modulo/03-aceitacao
npx vitest run tests/m03-*.test.ts   # um teste por vez, leia a falha inteira
scripts/validate-module.sh 03
git push -u origin modulo/03-aceitacao
# abra o PR para a main com Closes #N
```

> Travou? `docs/FLUXO.md`. A solução completa está na branch `reference` (consulte só depois de tentar).
