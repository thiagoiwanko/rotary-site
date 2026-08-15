# Regra obrigatória sobre Git e index.lock

- Nenhum agente pode executar operações Git que criem, alterem ou bloqueiem o índice deste repositório.
- É proibido executar `git add`, `git commit`, `git pull`, `git merge`, `git rebase`, `git checkout`, `git switch`, `git reset`, `git stash`, `git cherry-pick` ou qualquer outro comando Git de escrita.
- Somente consultas comprovadamente somente leitura, como `git status`, `git diff` e `git log`, são permitidas.
- Nunca crie manualmente o arquivo `.git/index.lock`.
- Antes e depois de trabalhar neste projeto, verifique se existe `.git/index.lock`.
- Se houver um `.git/index.lock`, confirme primeiro que não existe processo Git ativo. Remova o lock somente com autorização explícita do usuário.
- Para publicar notícias ou arquivos do site, use a API do GitHub ou o processo próprio do projeto, sem utilizar o índice Git local.
