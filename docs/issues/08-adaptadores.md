**Nível:** Intermediário  
**Validação automática:** `scripts/validate-module.sh 08` (o mesmo que o GitHub Actions roda no seu PR)

## Por que importa para avaliar agentes

Cada CLI de agente tem flags diferentes. Um adaptador fino e seguro permite trocar de agente sem mexer no resto.

## Leia antes

- agents.example.json
- Documentação ATUAL do Claude Code (modo headless `-p`) e do Codex CLI (`codex exec`): as flags mudam

## Tarefas

- [ ] `loadAgents`: validar a lista de agentes (todos os problemas de uma vez)
- [ ] `renderArgs`/`buildInvocation`: substituir `{{prompt}}`/`{{workdir}}` em ARRAYS (sem shell); placeholder desconhecido é erro
- [ ] `processRunner` e `overlayAgent` (agente falso determinístico que copia uma solução)

## Arquivos

- `src/agents/adapters.ts`

## Critério de pronto

- [ ] `scripts/validate-module.sh 08` termina com "✔ Módulo 08 concluído."
- [ ] Nenhum `todo('M08', ...)` restante
- [ ] PR aberto com `Closes #<número desta issue>` e check **Validar módulo** verde

## Desafio extra (opcional)

- Copie `agents.example.json` para `agents.json`, confira as flags de cada CLI na documentação e rode UMA tarefa com um agente real.

## Como entregar

```bash
git switch -c modulo/08-adaptadores
npx vitest run tests/m08-*.test.ts   # um teste por vez, leia a falha inteira
scripts/validate-module.sh 08
git push -u origin modulo/08-adaptadores
# abra o PR para a main com Closes #N
```

> Travou? `docs/FLUXO.md`. A solução completa está na branch `reference` (consulte só depois de tentar).
