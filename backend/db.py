from werkzeug.security import generate_password_hash

users = {
    "sabsuf@gmail.com": {
        "id": "user_1",
        "nick": "sabsuf",
        "email": "sabsuf@gmail.com",
        "age": 18,
        "password": generate_password_hash("1234")
    }
}


profiles = {
    "user_1": {
        "user_id": "user_1",
        "nick": "sabsuf",
        "email": "sabsuf@gmail.com",
        "age": 18,
        "main_language": "English",
        "steam": "sabsuf",
        "epic": "",
        "discord": "sabsuf",
        "description": "I like games and backend development."
    }
}


games = {
    "game_1": {
        "id": "game_1",
        "owner_id": "user_1",
        "game_name": "Minecraft",
        "date": "2026-06-11",
        "language": "English",
        "description": "Looking for someone to play survival together.",
        "status": "active",
        "likes": 0,
        "liked_by": []
    },
    "game_2": {
        "id": "game_2",
        "owner_id": "user_1",
        "game_name": "Payday 2",
        "date": "2026-06-11",
        "language": "Russian",
        "description": "Need teammate for heists.",
        "status": "backlog",
        "likes": 0,
        "liked_by": []
    }
}


def get_profile_by_user_id(user_id):
    return profiles.get(user_id)


def public_user(user):
    return {
        "id": user["id"],
        "nickname": user["nickname"],
        "email": user["email"],
        "user": user["age"]
    }


def public_game(game):
    owner_profile = profiles.get(game["owner_id"], {})

    return {
        "id": game["id"],
        "owner_id": game["owner_id"],
        "owner_nick": owner_profile.get("nickname", ""),
        "owner_discord": owner_profile.get("discord", ""),
        "game_name": game["game_name"],
        "date": game["date"],
        "language": game["language"],
        "description": game["description"],
        "status": game["status"],
        "likes": game["likes"]
    }