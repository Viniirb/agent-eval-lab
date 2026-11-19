**Nível:** Intermediário  
**Validação automática:** `scripts/validate-module.sh 04` (o mesmo que o GitHub Actions roda no seu PR)

## Por que importa para avaliar agentes

Aqui as regras viram checagens reais sobre os arquivos que o agente produziu.

## Leia antes

- docs/CONCEITOS.md seção 3

## Tarefas

- [ ] `globToRegExp`/`matchesGlob`/`matchesAny`: `*`, `**`, `**/`, `?`, escape de caracteres, separadores `\`
- [ ] `checkRules`: `forbidden-pattern` (linha por linha, com número da linha)
- [ ] `checkRules`: `required-file` e `import-boundary` (import estático, `export from`, `import()` e `require()`)

## Arquivos

- `src/rules/glob.ts`
- `src/rules/check.ts`

## Critério de pronto

- [ ] `scripts/validate-module.sh 04` termina com "✔ Módulo 04 concluído."
- [ ] Nenhum `todo('M04', ...)` restante
- [ ] PR aberto com `Closes #<número desta issue>` e check **Validar módulo** verde

## Desafio extra (opcional)

- Adicione um tipo de regra novo (por exemplo `max-file-lines`) em uma branch de experimento e veja o que precisa mudar.

## Como entregar

```bash
git switch -c modulo/04-verificadores
npx vitest run tests/m04-*.test.ts   # um teste por vez, leia a falha inteira
scripts/validate-module.sh 04
git push -u origin modulo/04-verificadores
# abra o PR para a main com Closes #N
```

> Travou? `docs/FLUXO.md`. A solução completa está na branch `reference` (consulte só depois de tentar).
