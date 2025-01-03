function toggleTransactionID() {
    const transactionIdFrame = document.getElementById('transaction_id_frame');
    transactionIdFrame.style.display = transactionIdFrame.style.display === 'none' ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('button, p, h1, img');
    
    elements.forEach((el, index) => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(20px)';
        setTimeout(() => {
            el.style.transition = 'opacity 1s ease, transform 1s ease';
            el.style.opacity = 1;
            el.style.transform = 'translateY(0)';
        }, index * 200);
    });

    checkUser();  // Load user data when the page is loaded

    // Apply glowing effect to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseover', () => {
            button.style.boxShadow = '0 0 20px rgba(255, 255, 0, 0.8)';
        });
        button.addEventListener('mouseout', () => {
            button.style.boxShadow = 'none';
        });
    });
});

function showRegisterForm() {
    document.getElementById('register_form').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('login_form').style.display = 'block';
}

function closeForm(formId) {
    document.getElementById(formId).style.display = 'none';
}

function checkUser() {
    // Check if the user is logged in by checking the local storage
    const address = localStorage.getItem('address');
    if (address) {
        document.getElementById('address').textContent = 'Ваш адрес: ' + address;
        document.getElementById('balance').textContent = 'Баланс $SF: ' + localStorage.getItem('balance');
    }
}

async function sendGift() {
    const fromAddress = localStorage.getItem('address');
    const toAddress = prompt("Введите адрес получателя:");
    const giftName = prompt("Введите имя подарка, который хотите отправить:");

    if (!fromAddress || !toAddress || !giftName) {
        alert("Все поля должны быть заполнены!");
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5500/send_gift', {
            method: 'POST', // Ensure the method is POST
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ from_address: fromAddress, to_address: toAddress, gift_name: giftName })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error);
        }

        const data = await response.json();
        alert(`Подарок успешно отправлен! Transaction ID: ${data.transaction_id}`);
    } catch (error) {
        alert(`Ошибка отправки подарка: ${error.message}`);
    }
}

async function register() {
    try {
        const response = await fetch('http://127.0.0.1:5000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Ошибка регистрации');
        }
        const data = await response.json();
        document.getElementById('address').textContent = 'Ваш адрес: ' + data.address;
        document.getElementById('seed').textContent = 'Ваш seed phrase: ' + data.seed;
        document.getElementById('balance').textContent = 'Баланс $SF: ' + data.balance;
        localStorage.setItem('address', data.address);
        localStorage.setItem('seed', data.seed);
        localStorage.setItem('balance', data.balance);
        document.getElementById('reg_message').textContent = 'Регистрация успешна!';
        closeForm('register_form');
    } catch (error) {
        document.getElementById('reg_message').textContent = error.message;
    }
}

async function login() {
    const seedWords = Array.from({ length: 12 }, (_, i) => document.getElementById(`seed_word_${i + 1}`).value.trim());
    const seed = seedWords.join(' ');

    if (seedWords.some(word => word === "")) {
        document.getElementById('login_message').textContent = 'Все поля должны быть заполнены!';
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ seed: seed })
        });

        if (!response.ok) {
            throw new Error('Ошибка входа');
        }

        const data = await response.json();
        document.getElementById('address').textContent = 'Ваш адрес: ' + data.address;
        document.getElementById('balance').textContent = 'Баланс $SF: ' + data.balance;
        localStorage.setItem('address', data.address);
        localStorage.setItem('balance', data.balance);
        document.getElementById('login_message').textContent = 'Вы успешно вошли в аккаунт!';
        closeForm('login_form');
    } catch (error) {
        document.getElementById('login_message').textContent = 'Неверный seed phrase!';
    }
}

async function getGift() {
    const address = localStorage.getItem('address');
    if (!address) {
        document.getElementById('login_message').textContent = 'Пожалуйста, сначала зарегистрируйтесь или войдите в аккаунт!';
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/get_gift', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ address: address })
        });

        if (!response.ok) {
            throw new Error('Ошибка получения подарка');
        }

        const data = await response.json();
        
        const rarityClass = data.gift.rarity.replace(' ', '-').toLowerCase();
        document.getElementById('gift_frame').className = `gift-frame ${rarityClass}`;
        document.getElementById('gift_title').textContent = `Название: ${data.gift.gift_title}`;
        document.getElementById('gift_rarity').textContent = data.gift.rarity;
        document.getElementById('gift_number').textContent = `#${data.gift.gift_number}`;
        document.getElementById('timestamp').textContent = 'Время: ' + new Date(data.timestamp * 1000).toLocaleString();
        document.getElementById('balance').textContent = 'Баланс $SF: ' + data.new_balance;
        localStorage.setItem('balance', data.new_balance);

        const giftImagePath = data.gift.gift_name ? `/${data.gift.rarity}/${data.gift.gift_name}` : '';
        if (giftImagePath) {
            document.getElementById('gift_image').src = giftImagePath;
            document.getElementById('gift_image').alt = data.gift.gift_name;
        } else {
            console.error("Имя изображения не определено:", data.gift.gift_name);
        }

        // Create the Transaction ID toggle
        const transactionIdElement = document.getElementById('transaction_id');
        transactionIdElement.innerHTML = `<span id="toggle_transaction_id" style="cursor:pointer; color:blue;">REVEAL TRANSACTION ID</span><div id="transaction_id_frame" class="transaction-frame" style="display:none; background-color:white; color:black; font-family: 'IBM Plex Mono', monospace; padding: 5px; border-radius: 5px; word-wrap: break-word;">${data.transaction_id}</div>`;
        document.getElementById('toggle_transaction_id').addEventListener('click', toggleTransactionID);

        document.querySelector('.rarity-container').className = `rarity-container ${rarityClass}`;
    } catch (error) {
        document.getElementById('login_message').textContent = error.message;
    }
}

async function showInventory() {
    const address = localStorage.getItem('address');
    if (!address) {
        document.getElementById('login_message').textContent = 'Пожалуйста, сначала зарегистрируйтесь или войдите в аккаунт!';
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/inventory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ address: address })
        });

        if (!response.ok) {
            throw new Error('Ошибка получения инвентаря');
        }

        const data = await response.json();
        document.getElementById('balance').textContent = 'Баланс $SF: ' + data.balance;
        localStorage.setItem('balance', data.balance);

        filterInventory(data.inventory);
    } catch (error) {
        document.getElementById('login_message').textContent = error.message;
    }
}

function filterInventory(inventory = JSON.parse(localStorage.getItem('inventory')) || []) {
    const filter = document.getElementById('filter').value;
    localStorage.setItem('inventory', JSON.stringify(inventory));

    const rarityOrder = ['Epic', 'Ultra Rare', 'Rare', 'Uncommon', 'Common'];
    const compareRarity = (a, b) => rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);

    switch (filter) {
        case 'rarity-desc':
            inventory.sort((a, b) => compareRarity(a, b));
            break;
        case 'number-asc':
            inventory.sort((a, b) => a.gift_number - b.gift_number);
            break;
        case 'rarity-asc':
            inventory.sort((a, b) => compareRarity(b, a));
            break;
        default:
            inventory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    const inventoryDiv = document.getElementById('inventory');
    inventoryDiv.innerHTML = '';
    inventory.forEach(item => {
        const rarityClass = item.rarity.replace(' ', '-').toLowerCase();
        const itemDiv = document.createElement('div');
        itemDiv.className = `inventory-item ${rarityClass}`;
        itemDiv.innerHTML = `
            <p class="item-rarity">${item.rarity}</p>
            <p>Название: ${item.gift_title}</p>
            <p>#${item.gift_number}</p>
            <img src="./${item.rarity}/${item.gift_name}" alt="${item.gift_name}" class="gift-img" />
        `;
        inventoryDiv.appendChild(itemDiv);
    });
}