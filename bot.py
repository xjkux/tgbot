import hashlib
import time
import random
from flask import Flask, render_template, jsonify, request
import threading

app = Flask(__name__)

# Глобальная переменная для баланса
user_balance = 0.0

# Функция для создания хеша блока и майнинга
def mine_block(block_data, difficulty):
    global user_balance
    nonce = 0
    target = '0' * difficulty  # требуемая сложность

    while True:
        data = block_data + str(nonce)
        block_hash = hashlib.sha256(data.encode()).hexdigest()

        if block_hash.startswith(target):
            # Генерация уникальной награды на основе хеша
            reward = (int(block_hash, 16) % 1000) / 100  # Преобразуем хеш в число и делим для получения разумного диапазона
            # Награда будет зависеть от сложности: чем выше сложность, тем выше минимальная награда
            reward = max(reward, difficulty * 0.1)  # минимальная награда для высокой сложности

            user_balance += reward
            return user_balance

        nonce += 1

# Функция, создающая нагрузку
def create_heavy_load(difficulty, repetitions):
    global user_balance
    block_data = "Block #1 - Добыча монеты PINK"
    
    for i in range(repetitions):  # Майним указанное количество блоков
        user_balance = mine_block(block_data, difficulty)
    
# Главная функция для начала майнинга
def start_mining(difficulty, repetitions):
    # Дополнительно увеличиваем нагрузку
    threads = []
    for _ in range(5):  # Запускаем несколько потоков для параллельного выполнения майнинга
        thread = threading.Thread(target=create_heavy_load, args=(difficulty, repetitions))
        threads.append(thread)
        thread.start()

    for thread in threads:
        thread.join()  # Ожидаем завершения всех потоков

@app.route('/')
def index():
    return render_template('index.html', balance=user_balance)

@app.route('/start_mining', methods=['GET'])
def start_mining_route():
    global user_balance
    difficulty = int(request.args.get('difficulty', 5))  # Получаем сложность из запроса
    repetitions = int(request.args.get('repetitions', 5))  # Получаем количество повторений из запроса

    start_time = time.time()
    start_mining(difficulty, repetitions)
    end_time = time.time()
    
    return jsonify(
        {"message": f"Майнинг завершен за {end_time - start_time:.2f} секунд",
         "final_balance": round(user_balance, 2)})

if __name__ == "__main__":
    app.run(debug=True)
