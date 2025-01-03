import hashlib
import time
import json

class Block:
    def __init__(self, index, previous_hash, timestamp, data, hash):
        self.index = index
        self.previous_hash = previous_hash
        self.timestamp = timestamp
        self.data = data
        self.hash = hash

def calculate_hash(index, previous_hash, timestamp, data):
    value = str(index) + str(previous_hash) + str(timestamp) + json.dumps(data, sort_keys=True)
    return hashlib.sha256(value.encode()).hexdigest()

def create_genesis_block():
    return Block(0, "0", int(time.time()), {}, calculate_hash(0, "0", int(time.time()), {}))

def create_new_block(previous_block, data):
    index = previous_block.index + 1
    timestamp = int(time.time())
    previous_hash = previous_block.hash
    hash = calculate_hash(index, previous_hash, timestamp, data)
    return Block(index, previous_hash, timestamp, data, hash)

blockchain = [create_genesis_block()]
previous_block = blockchain[0]

def add_data_to_blockchain(data):
    global previous_block
    block_to_add = create_new_block(previous_block, data)
    blockchain.append(block_to_add)
    previous_block = block_to_add
    return block_to_add