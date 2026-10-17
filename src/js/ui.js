// Gestão de Menus, Loja, Inventário UI e Painel Sandbox

let shopOpen = false;
let currentSandboxTool = null;

function openShop() { 
    shopOpen = true; 
    document.getElementById('shop-modal').style.display = 'block'; 
}

function closeShop() { 
    shopOpen = false; 
    document.getElementById('shop-modal').style.display = 'none'; 
}

function buyItem(type, cost) {
    if (player.coins < cost) return alert('Moedas insuficientes!');
    if (type === 'seed') {
        if (player.seeds >= player.maxCap) return alert('Mochila cheia!');
        player.seeds++; player.coins -= cost;
    } else if (type === 'bag') {
        player.maxCap += 5; player.coins -= cost;
    } else if (type === 'cow') {
        animals.push(new Animal('cow', 5, 5));
        player.coins -= cost;
    } else if (type === 'sheep') {
        animals.push(new Animal('sheep', 6, 5));
        player.coins -= cost;
    } else if (type === 'chicken') {
        animals.push(new Animal('chicken', 5, 6));
        player.coins -= cost;
    } else if (type === 'horse') {
        animals.push(new Animal('horse', 6, 6));
        player.coins -= cost;
    }
    playSound('coins');
    updateUI();
}

function sellAll() {
    const total = (player.milk * 15) + (player.wool * 18) + (player.cheese * 45) + (player.eggs * 10) + (player.wheat * 12);
    if (total === 0) return alert('Sem produtos para vender!');
    player.coins += total;
    player.milk = 0; player.wool = 0; player.cheese = 0; player.eggs = 0; player.wheat = 0;
    playSound('coins');
    updateUI();
}

function updateUI() {
    document.getElementById('coins').innerText = player.coins;
    document.getElementById('maxCap').innerText = player.maxCap;
    document.getElementById('seeds').innerText = player.seeds;
    document.getElementById('wheat').innerText = player.wheat;
    document.getElementById('milk').innerText = player.milk;
    document.getElementById('wool').innerText = player.wool;
    document.getElementById('cheese').innerText = player.cheese;
    document.getElementById('eggs').innerText = player.eggs;
}

function setSandboxTool(tool) {
    currentSandboxTool = (currentSandboxTool === tool) ? null : tool;
    
    document.querySelectorAll('#test-sandbox-panel button').forEach(b => {
        if (b.id !== 'btn-remove') b.style.border = 'none';
    });
    
    document.getElementById('btn-remove').style.border = 'none';

    if (currentSandboxTool) {
        const activeBtn = document.getElementById(`btn-${currentSandboxTool}`);
        if (activeBtn) activeBtn.style.border = '2px solid #4ade80';
        document.getElementById('current-tool-label').innerText = `Ativo: ${currentSandboxTool.toUpperCase()}`;
    } else {
        document.getElementById('current-tool-label').innerText = 'Ferramenta Ativa: Nenhum';
    }
}