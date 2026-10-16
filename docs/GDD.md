# GDD: Fazenda Sim (Nome Provisório)

## 1. Visão Geral
* **Gênero:** Simulação de Fazenda / Gerenciamento de Recursos / RPG Top-Down (2D).
* **Plataforma Target:** PC / Web / Mobile.
* **Estilo Visual:** Pixel Art 2D (visão superior / isométrica / top-down).
* **Objetivo do Jogador:** Expandir a fazenda, administrar a produção animal e vegetal, processar matérias-primas e comercializar produtos para enriquecer e liberar novas instalações.

## 2. Loop Principal de Gameplay (Core Loop)
1. **Manejo:** Alimentar animais, cuidar das criações e plantar.
2. **Coleta/Processamento:** Coletar leite/ovos, processar em queijo, maionese, etc.
3. **Construção:** Criar novos recintos, currais e estruturas de produção.
4. **Economia:** Vender os produtos na feira/mercado local para obter moedas.
5. **Progressão:** Reinvestir moedas para expandir o terreno e desbloquear novos animais.

## 3. Sistemas Principais (MVP)
* **Sistema de Animação e Movimentação:** Jogador interage com objetos e animais do cenário.
* **Sistema de Animais:**
  * **Vacas:** Alimentar -> Ordenhar -> Obter Leite.
  * **Galinhas:** Alimentar -> Esperar ciclo -> Coletar Ovos.
* **Sistema de Processamento:**
  * **Prensa de Queijo:** Leite -> Queijo.
* **Sistema de Construção (Grid System):** Construção de cercas, currais e recintos posicionados em uma grade.
* **Sistema de Economia:** Inventário do jogador, loja/mercado e controle de moedas.