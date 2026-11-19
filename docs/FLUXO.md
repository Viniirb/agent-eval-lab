# Fluxo de estudo

A issue #N é o módulo N-1 (#1 = módulo 00).

1. Abra a issue do módulo: objetivo, conceitos, tarefas, critério de pronto.
2. Leia a seção correspondente de `docs/CONCEITOS.md` e o KDoc de cada função (a especificação está nos comentários e nos testes).
3. Crie a branch: `git switch -c modulo/NN-nome` (o prefixo `modulo/NN-` é obrigatório).
4. Troque os `todo('MNN', ...)` por código. Rode o teste do módulo: `npx vitest run tests/mNN-*.test.ts`.
5. Valide: `scripts/validate-module.sh NN`. Repita até `✔ Módulo NN concluído.`
6. `git push -u origin modulo/NN-nome` e abra o PR para `main` com `Closes #N`.
7. Espere o check **Validar módulo NN** ficar verde. Faça o merge (squash). A issue fecha.

## O que o CI confere

| Verificação | O que bloqueia |
|-------------|----------------|
| Integridade | PR que **modifica ou apaga** `tests/`, `scripts/`, `.github/`, `tasks/001-*`, `src/types.ts`, `src/todo.ts`, `src/cli.ts`, `package*.json`, `tsconfig.json`, `vitest.config.ts`. Arquivos **novos** são permitidos. |
| Testes do módulo | Qualquer teste do módulo falhando (e `tsc` sem erros). |
| TODOs | `todo('MNN', ...)` ainda presente em `src/`. |

## Dicas

- Um teste por vez: `npx vitest run tests/m04-glob-check.test.ts -t "glob"`.
- Leia a mensagem de falha inteira: ela mostra o valor recebido e o esperado.
- Travou? Releia o KDoc, depois reduza o problema a um exemplo de 3 linhas. Só então consulte `git show reference:src/...`.
- O módulo 15 roda `vitest` e `tsc` de verdade em uma cópia isolada: leva alguns segundos.
- O módulo 13 pede um workflow **seu** (`.github/workflows/benchmark.yml`). Criar arquivo novo em `.github/` é permitido.
- Repositório privado no plano gratuito não tem proteção de branch obrigatória: só faça merge com o check verde.
