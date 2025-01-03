from flask import Flask, request, jsonify
from flask_cors import CORS
import hashlib
import mnemonic
import time
import json
import os
import random

# Blockchain and gift management imports
from blockchain import blockchain, add_data_to_blockchain
from gift_management import select_random_gift, GIFT_FOLDERS, RARITY_CATEGORIES

# Хранение информации о пользователях
users = {}

def create_user():
    mnemo = mnemonic.Mnemonic("english")
    seed = mnemo.generate(strength=128)
    address = hashlib.sha256(seed.encode()).hexdigest()
    users[address] = {
        "seed": seed,
        "balance": 100,
        "inventory": []
    }
    return address, seed

# Flask application
app = Flask(__name__)
CORS(app)

@app.route('/register', methods=['POST'])
def register():
    address, seed = create_user()
    return jsonify({"address": address, "seed": seed, "balance": users[address]["balance"]})

@app.route('/login', methods=['POST'])
def login():
    seed = request.json.get("seed")
    for address, user_info in users.items():
        if user_info["seed"] == seed:
            return jsonify({"address": address, "balance": user_info["balance"]})
    return jsonify({"error": "Invalid seed phrase"}), 401

@app.route('/get_gift', methods=['POST'])
def get_gift():
    user_address = request.json.get("address")
    if user_address not in users:
        return jsonify({"error": "Invalid user address"}), 401
    
    gift_name, gift_title, rarity = select_random_gift()
    gift_number = sum(1 for block in blockchain if block.data.get('gift_name') == gift_name) + 1
    gift_data = {
        "user_address": user_address,
        "rarity": rarity,
        "gift_name": gift_name,
        "gift_title": gift_title,
        "gift_number": gift_number
    }
    new_block = add_data_to_blockchain(gift_data)
    users[user_address]["inventory"].append(gift_data)
    users[user_address]["balance"] += 10
    return jsonify({
        "gift": gift_data,
        "transaction_id": new_block.hash,
        "timestamp": new_block.timestamp,
        "new_balance": users[user_address]["balance"]
    })

@app.route('/inventory', methods=['POST'])
def inventory():
    user_address = request.json.get("address")
    if user_address not in users:
        return jsonify({"error": "Invalid user address"}), 401
    return jsonify({"inventory": users[user_address]["inventory"], "balance": users[user_address]["balance"]})

if __name__ == '__main__':
    app.run(debug=True, port=5500)