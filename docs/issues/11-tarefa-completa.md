**Nível:** Avançado  
**Validação automática:** `scripts/validate-module.sh 11` (o mesmo que o GitHub Actions roda no seu PR)

## Por que importa para avaliar agentes

A qualidade do benchmark vem das tarefas. Escrever uma do zero ensina o que torna uma tarefa justa e verificável.

## Leia antes

- tasks/001-rate-limiter/ (a tarefa de exemplo inteira)

## Tarefas

- [ ] `parseTaskConfig`: validar `task.json`
- [ ] `lintTask`: id = nome da pasta, SPEC/RULES válidos, starter com tsconfig, acceptance com testes, todo MUST com teste etiquetado, golden e 2+ mutantes
- [ ] Criar `tasks/002-<nome>/` completa (task.json, SPEC.md, RULES.md, starter/, acceptance/, golden/, mutants/ com 2+ pastas) que passe em `npm run bench -- lint`

## Arquivos

- `src/tasks/lint.ts`
- `tasks/002-*/ (sua tarefa)`

## Critério de pronto

- [ ] `scripts/validate-module.sh 11` termina com "✔ Módulo 11 concluído."
- [ ] Nenhum `todo('M11', ...)` restante
- [ ] PR aberto com `Closes #<número desta issue>` e check **Validar módulo** verde

## Desafio extra (opcional)

- Valide a sua tarefa com o módulo 10: golden >= 95 e todos os mutantes < 95.

## Como entregar

```bash
git switch -c modulo/11-tarefa-completa
npx vitest run tests/m11-*.test.ts   # um teste por vez, leia a falha inteira
scripts/validate-module.sh 11
git push -u origin modulo/11-tarefa-completa
# abra o PR para a main com Closes #N
```

> Travou? `docs/FLUXO.md`. A solução completa está na branch `reference` (consulte só depois de tentar).
