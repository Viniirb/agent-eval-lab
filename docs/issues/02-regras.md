**Nível:** Básico  
**Validação automática:** `scripts/validate-module.sh 02` (o mesmo que o GitHub Actions roda no seu PR)

## Por que importa para avaliar agentes

Convenções só em prosa não são verificáveis. Aqui você transforma regras em dados que uma máquina checa, e trata o arquivo como entrada não confiável.

## Leia antes

- docs/CONCEITOS.md seção 3
- tasks/001-rate-limiter/RULES.md

## Tarefas

- [ ] `parseRules`: extrair o PRIMEIRO bloco ```json e validar cada regra (`forbidden-pattern`, `required-file`, `import-boundary`)
- [ ] Validar id (`RULE-001`), mensagem, regex válida, listas de globs; ids únicos
- [ ] Lançar `RuleError` com TODOS os problemas de uma vez (não só o primeiro)

## Arquivos

- `src/rules/rules.ts`

## Critério de pronto

- [ ] `scripts/validate-module.sh 02` termina com "✔ Módulo 02 concluído."
- [ ] Nenhum `todo('M02', ...)` restante
- [ ] PR aberto com `Closes #<número desta issue>` e check **Validar módulo** verde

## Desafio extra (opcional)

- Escreva as regras do SEU projeto real em formato RULES.md e veja quais não cabem em nenhum tipo.

## Como entregar

```bash
git switch -c modulo/02-regras
npx vitest run tests/m02-*.test.ts   # um teste por vez, leia a falha inteira
scripts/validate-module.sh 02
git push -u origin modulo/02-regras
# abra o PR para a main com Closes #N
```

> Travou? `docs/FLUXO.md`. A solução completa está na branch `reference` (consulte só depois de tentar).
