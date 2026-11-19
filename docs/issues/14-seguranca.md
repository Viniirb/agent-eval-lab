**Nível:** Avançado  
**Validação automática:** `scripts/validate-module.sh 14` (o mesmo que o GitHub Actions roda no seu PR)

## Por que importa para avaliar agentes

Agentes otimizam o que você mede. E arquivos de tarefa copiados da internet podem conter ordens escondidas.

## Leia antes

- docs/CONCEITOS.md seção 6

## Tarefas

- [ ] `scanForCheating`: `it.skip/only/todo`, `xit`, `process.exit(0)`, `@ts-ignore`/`eslint-disable`, rede, `process.env` (com caminho e linha, ordenado)
- [ ] `scanForInjection`: frases do tipo "ignore as instruções anteriores", "reveal your system prompt" e caracteres invisíveis (zero-width, bidi)
- [ ] Escrever `docs/AMEACAS.md` com 5 formas de burlar SEU benchmark e a defesa de cada uma (50+ palavras no total)

## Arquivos

- `src/safety/safety.ts`
- `docs/AMEACAS.md`

## Critério de pronto

- [ ] `scripts/validate-module.sh 14` termina com "✔ Módulo 14 concluído."
- [ ] Nenhum `todo('M14', ...)` restante
- [ ] PR aberto com `Closes #<número desta issue>` e check **Validar módulo** verde

## Desafio extra (opcional)

- Tente você mesmo burlar a tarefa 001 sem implementar nada. O que a nota diz?

## Como entregar

```bash
git switch -c modulo/14-seguranca
npx vitest run tests/m14-*.test.ts   # um teste por vez, leia a falha inteira
scripts/validate-module.sh 14
git push -u origin modulo/14-seguranca
# abra o PR para a main com Closes #N
```

> Travou? `docs/FLUXO.md`. A solução completa está na branch `reference` (consulte só depois de tentar).
