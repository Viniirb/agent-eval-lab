**Nível:** Intermediário  
**Validação automática:** `scripts/validate-module.sh 05` (o mesmo que o GitHub Actions roda no seu PR)

## Por que importa para avaliar agentes

Um agente que resolve a tarefa mexendo em 40 arquivos ou editando os testes não é um bom resultado. O escopo é parte da nota.

## Leia antes

- docs/CONCEITOS.md seção 6

## Tarefas

- [ ] `checkScope`: separar `protectedTouched` (qualquer tipo de mudança), `outOfScope` e `tooManyFiles`
- [ ] Protegido tem prioridade sobre fora-de-escopo; listas ordenadas; limite exato é permitido

## Arquivos

- `src/scope/scope.ts`

## Critério de pronto

- [ ] `scripts/validate-module.sh 05` termina com "✔ Módulo 05 concluído."
- [ ] Nenhum `todo('M05', ...)` restante
- [ ] PR aberto com `Closes #<número desta issue>` e check **Validar módulo** verde

## Desafio extra (opcional)

- Que arquivos você protegeria em um projeto real além de testes e specs? (lockfiles? CI? migrations?)

## Como entregar

```bash
git switch -c modulo/05-escopo
npx vitest run tests/m05-*.test.ts   # um teste por vez, leia a falha inteira
scripts/validate-module.sh 05
git push -u origin modulo/05-escopo
# abra o PR para a main com Closes #N
```

> Travou? `docs/FLUXO.md`. A solução completa está na branch `reference` (consulte só depois de tentar).
