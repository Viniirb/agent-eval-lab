**Nível:** Avançado  
**Validação automática:** `scripts/validate-module.sh 16` (o mesmo que o GitHub Actions roda no seu PR)

## Por que importa para avaliar agentes

Fechamento: dados reais de agentes reais, com método.

## Leia antes

- docs/FINDINGS.md (exemplo de formato)
- docs/CONCEITOS.md seção 9

## Tarefas

- [ ] Rodar pelo menos 2 agentes reais (por exemplo Claude Code e Codex) em pelo menos 3 tarefas, 3 rodadas cada
- [ ] Fazer um A/B: com e sem arquivo de regras (ou dois prompts) e comparar com `compareConditions`
- [ ] Escrever `docs/FINDINGS.md` (300+ palavras): pergunta, método, resultados, surpresas, limites e próximos passos
- [ ] `scripts/validate-module.sh 16` (todos os testes, zero `todo(`, relatório escrito)

## Arquivos

- `docs/FINDINGS.md`
- `results/ (local, não versionado)`

## Critério de pronto

- [ ] `scripts/validate-module.sh 16` termina com "✔ Módulo 16 concluído."
- [ ] Nenhum `todo('M16', ...)` restante
- [ ] PR aberto com `Closes #<número desta issue>` e check **Validar módulo** verde

## Desafio extra (opcional)

- Publique seus achados e as tarefas como repositório aberto (sem segredos) para outros reproduzirem.

## Como entregar

```bash
git switch -c modulo/16-experimento-real
npx vitest run tests/m16-*.test.ts   # um teste por vez, leia a falha inteira
scripts/validate-module.sh 16
git push -u origin modulo/16-experimento-real
# abra o PR para a main com Closes #N
```

> Travou? `docs/FLUXO.md`. A solução completa está na branch `reference` (consulte só depois de tentar).
