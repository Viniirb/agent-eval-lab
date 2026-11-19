**Nível:** Intermediário  
**Validação automática:** `scripts/validate-module.sh 06` (o mesmo que o GitHub Actions roda no seu PR)

## Por que importa para avaliar agentes

Transformar evidências em uma nota é uma decisão de design. Os tetos impedem que trapacear compense.

## Leia antes

- docs/CONCEITOS.md seção 1
- Comentário (KDoc) de `computeScore`

## Tarefas

- [ ] `gradeFor`: A ≥ 90, B ≥ 75, C ≥ 60, D ≥ 40, F
- [ ] `computeScore`: functional, rules (ids DISTINTOS violados), scope, quality, pesos e arredondamento
- [ ] Tetos: arquivo protegido alterado => máx. 40; testes não rodaram => máx. 30; pesos precisam somar 1

## Arquivos

- `src/scoring/score.ts`

## Critério de pronto

- [ ] `scripts/validate-module.sh 06` termina com "✔ Módulo 06 concluído."
- [ ] Nenhum `todo('M06', ...)` restante
- [ ] PR aberto com `Closes #<número desta issue>` e check **Validar módulo** verde

## Desafio extra (opcional)

- Mude os pesos para 0.4/0.3/0.2/0.1 e explique, com um exemplo, quando o ranking de dois agentes inverte.

## Como entregar

```bash
git switch -c modulo/06-pontuacao
npx vitest run tests/m06-*.test.ts   # um teste por vez, leia a falha inteira
scripts/validate-module.sh 06
git push -u origin modulo/06-pontuacao
# abra o PR para a main com Closes #N
```

> Travou? `docs/FLUXO.md`. A solução completa está na branch `reference` (consulte só depois de tentar).
