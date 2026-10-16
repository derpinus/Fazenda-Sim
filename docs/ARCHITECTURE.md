# Arquitetura Técnica do Projeto

## 1. Padrão de Projeto
* **Arquitetura Base:** Modulada orientada a eventos e componentes (Component-Based Pattern).
* **Grid System:** O mundo do jogo opera em uma matriz de tiles (Grid 16x16 ou 32x32) para posicionamento exato de currais, animais e construções.

## 2. Modelagem de Dados Principais
* **`ItemData` (ScriptableObject / DataStruct):** ID, Nome, Preço de Venda, Ícone Visual.
* **`AnimalState`:** Nível de Fome, Felicidade, Tempo para Próxima Produção (Leite/Ovo), Tipo de Animal.
* **`BuildingData`:** Custo de Construção, Área Ocupada no Grid, Tipo de Processamento.

## 3. Padrão de Comunicação de Scripts
* **Event Manager:** Notifica o sistema de economia quando um item é vendido sem acoplamento direto entre a Loja e o Inventário.