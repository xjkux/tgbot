import os
import random

# Путь к папкам с изображениями
GIFT_FOLDERS = {
    "Epic": "./Epic",
    "Ultra Rare": "./Ultra Rare",
    "Rare": "./Rare",
    "Uncommon": "./Uncommon",
    "Common": "./Common"
}

# Определение шансов выпадения для каждой редкости (в процентах)
RARITY_PROBABILITIES = {
    "Epic": 5,  # 1% шанс
    "Ultra Rare": 3,  # 3% шанс
    "Rare": 6,  # 6% шанс
    "Uncommon": 15,  # 15% шанс
    "Common": 75  # 75% шанс
}

# Словарь с редкостью подарков
RARITY_CATEGORIES = list(GIFT_FOLDERS.keys())

def select_random_gift():
    rarity = random.choices(
        population=RARITY_CATEGORIES,
        weights=[RARITY_PROBABILITIES[r] for r in RARITY_CATEGORIES],
        k=1
    )[0]
    folder_path = GIFT_FOLDERS[rarity]
    files = os.listdir(folder_path)
    gift_name = random.choice(files)
    gift_title = os.path.splitext(gift_name)[0]
    print(f"Selected gift: {gift_name}, Title: {gift_title}, Rarity: {rarity}")  # Логируем выбранный подарок
    return gift_name, gift_title, rarity