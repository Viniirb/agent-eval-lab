**Nível:** Intermediário  
**Validação automática:** `scripts/validate-module.sh 07` (o mesmo que o GitHub Actions roda no seu PR)

## Por que importa para avaliar agentes

Cada rodada precisa começar limpa e deixar rastros auditáveis (o diff). E rodar comandos sem shell evita injeção.

## Leia antes

- Documentação do Node: `child_process.spawn`, `fs.cp`, `crypto`

## Tarefas

- [ ] `prepareWorkdir`: cópia limpa do starter, tests de aceitação e `node_modules` por symlink
- [ ] `snapshot` (hash SHA-256 por arquivo, ignora `node_modules` e `.git`) e `diffSnapshots`
- [ ] `runCommand`: sem shell, captura saída, timeout que mata o processo, nunca rejeita

## Arquivos

- `src/sandbox/sandbox.ts`

## Critério de pronto

- [ ] `scripts/validate-module.sh 07` termina com "✔ Módulo 07 concluído."
- [ ] Nenhum `todo('M07', ...)` restante
- [ ] PR aberto com `Closes #<número desta issue>` e check **Validar módulo** verde

## Desafio extra (opcional)

- Rode o agente com um `HOME` temporário e um `PATH` mínimo. O que quebra? O que isso ensina sobre isolamento?

## Como entregar

```bash
git switch -c modulo/07-sandbox
npx vitest run tests/m07-*.test.ts   # um teste por vez, leia a falha inteira
scripts/validate-module.sh 07
git push -u origin modulo/07-sandbox
# abra o PR para a main com Closes #N
```

> Travou? `docs/FLUXO.md`. A solução completa está na branch `reference` (consulte só depois de tentar).
