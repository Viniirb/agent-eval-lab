**Nível:** Intermediário  
**Validação automática:** `scripts/validate-module.sh 09` (o mesmo que o GitHub Actions roda no seu PR)

## Por que importa para avaliar agentes

Resultado que ninguém lê não muda decisão. A tabela comparativa é o produto final do benchmark.

## Tarefas

- [ ] `aggregateByAgent`: média (1 casa), melhor, pior, conceito; ordem por média e depois nome
- [ ] `renderReport`: Markdown exatamente no formato do KDoc (o teste compara o texto inteiro)

## Arquivos

- `src/report/report.ts`

## Critério de pronto

- [ ] `scripts/validate-module.sh 09` termina com "✔ Módulo 09 concluído."
- [ ] Nenhum `todo('M09', ...)` restante
- [ ] PR aberto com `Closes #<número desta issue>` e check **Validar módulo** verde

## Desafio extra (opcional)

- Acrescente uma coluna com a duração média por agente.

## Como entregar

```bash
git switch -c modulo/09-relatorios
npx vitest run tests/m09-*.test.ts   # um teste por vez, leia a falha inteira
scripts/validate-module.sh 09
git push -u origin modulo/09-relatorios
# abra o PR para a main com Closes #N
```

> Travou? `docs/FLUXO.md`. A solução completa está na branch `reference` (consulte só depois de tentar).
