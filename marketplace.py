from user_management import users  # Импортируем переменную users из user_management

marketplace = []

def create_offer(seller_address, gift, price):
    offer = {
        "seller_address": seller_address,
        "gift": gift,
        "price": price,
        "offer_id": len(marketplace) + 1
    }
    marketplace.append(offer)
    return offer

def get_offers():
    return marketplace

def buy_offer(buyer_address, offer_id):
    offer = next((o for o in marketplace if o["offer_id"] == offer_id), None)
    if offer is None:
        return {"error": "Offer not found"}, 404

    seller_address = offer["seller_address"]
    price = offer["price"]
    gift = offer["gift"]

    if users[buyer_address]["balance"] < price:
        return {"error": "Insufficient balance"}, 400

    users[buyer_address]["balance"] -= price
    users[seller_address]["balance"] += price
    users[buyer_address]["inventory"].append(gift)
    users[seller_address]["inventory"].remove(gift)
    marketplace.remove(offer)

    return {"message": "Purchase successful"}