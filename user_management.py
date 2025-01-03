import hashlib
import mnemonic

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