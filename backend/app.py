from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from uuid import uuid4
from db import users, profiles, games, get_profile_by_user_id, public_user, public_game

app = Flask(__name__)
app.secret_key = "dev-secret-key"
CORS(app, supports_credentials=True)

# =========================
# HELPERS
# =========================

def get_current_user():
    user_id = session.get("user_id")

    if not user_id:
        return None

    for email, user in users.items():
        if user["id"] == user_id:
            return user

    return None

# =========================
# HEALTH
# =========================

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "message": "Backend is running"
    }), 200


# =========================
# AUTH
# =========================

@app.route("/api/auth/register", methods=["POST"])
@app.route("/api/auth/signup", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return jsonify({
            "message": "No JSON data"
        }), 400

    email = data.get("email")
    nickname = data.get("nickname")
    age = data.get("age")
    password = data.get("password")

    if not email or not nickname or not age or not password:
        return jsonify({
            "message": "Email, nickname, age and password are required"
        }), 400

    if email in users:
        return jsonify({
            "message": "User already exists"
        }), 409

    user_id = "user_" + str(uuid4())

    users[email] = {
        "id": user_id,
        "email": email,
        "nickname": nickname,
        "age": age,
        "password": generate_password_hash(password)
    }

    profiles[user_id] = {
        "user_id": user_id,
        "email": email,
        "nickname": nickname,
        "age": age,
        "main_language": "",
        "steam": "",
        "epic": "",
        "discord": "",
        "description": ""
    }

    session["user_id"] = user_id

    return jsonify({
        "message": "Registration successful",
        "user": {
            "id": user_id,
            "email": email,
            "nickname": nickname,
            "age": age
        }
    }), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({
            "message": "No JSON data"
        }), 400

    email = data.get("email")
    password = data.get("password")
    remember = data.get("remember", False)

    if not email or not password:
        return jsonify({
            "message": "Email and password are required"
        }), 400

    if email not in users:
        return jsonify({
            "message": "No such user"
        }), 404

    user = users[email]

    if not check_password_hash(user["password"], password):
        return jsonify({
            "message": "Wrong password"
        }), 401

    session["user_id"] = user["id"]
    session.permanent = bool(remember)

    return jsonify({
        "message": "Login successful",
        "user": public_user(user)
    }), 200


@app.route("/api/auth/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)

    return jsonify({
        "message": "Logout successful"
    }), 200


@app.route("/api/auth/me", methods=["GET"])
def me():
    user = get_current_user()

    if not user:
        return jsonify({
            "logged_in": False,
            "user": None
        }), 401

    return jsonify({
        "logged_in": True,
        "user": public_user(user)
    }), 200


# =========================
# PROFILE
# =========================

@app.route("/api/profile/me", methods=["GET"])
def get_my_profile():
    user = get_current_user()

    if not user:
        return jsonify({
            "message": "Unauthorized"
        }), 401

    profile = get_profile_by_user_id(user["id"])

    return jsonify({
        "profile": profile
    }), 200


@app.route("/api/profile/me", methods=["PUT"])
def update_my_profile():
    user = get_current_user()

    if not user:
        return jsonify({
            "message": "Unauthorized"
        }), 401

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "No JSON data"
        }), 400

    profile = profiles[user["id"]]

    profile["nickname"] = data.get("nickname", profile["nickname"])
    profile["age"] = data.get("age", profile["age"])
    profile["main_language"] = data.get("main_language", profile["main_language"])
    profile["steam"] = data.get("steam", profile["steam"])
    profile["epic"] = data.get("epic", profile["epic"])
    profile["discord"] = data.get("discord", profile["discord"])
    profile["description"] = data.get("description", profile["description"])

    user["nickname"] = profile["nickname"]

    return jsonify({
        "message": "Profile updated",
        "profile": profile
    }), 200


@app.route("/api/profiles", methods=["GET"])
def get_all_profiles():
    all_profiles = list(profiles.values())

    return jsonify({
        "profiles": all_profiles
    }), 200


# =========================
# GAMES
# =========================

@app.route("/api/games", methods=["GET"])
def get_games():
    status = request.args.get("status")
    language = request.args.get("language")

    result = []

    for game in games.values():
        if status and game["status"] != status:
            continue

        if language and game["language"].lower() != language.lower():
            continue

        result.append(public_game(game))

    return jsonify({
        "games": result
    }), 200


@app.route("/api/games/me", methods=["GET"])
def get_my_games():
    user = get_current_user()

    if not user:
        return jsonify({
            "message": "Unauthorized"
        }), 401

    my_games = []

    for game in games.values():
        if game["owner_id"] == user["id"]:
            my_games.append(public_game(game))

    return jsonify({
        "games": my_games
    }), 200


@app.route("/api/games", methods=["POST"])
def add_game():
    user = get_current_user()

    if not user:
        return jsonify({
            "message": "Unauthorized"
        }), 401

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "No JSON data"
        }), 400

    game_name = data.get("game_name")
    date = data.get("date")
    language = data.get("language")
    description = data.get("description")
    status = data.get("status", "active")

    if not game_name or not date or not language or not description:
        return jsonify({
            "message": "Game name, date, language and description are required"
        }), 400

    if status not in ["active", "finished", "backlog"]:
        return jsonify({
            "message": "Status must be active, finished or backlog"
        }), 400

    game_id = "game_" + str(uuid4())

    games[game_id] = {
        "id": game_id,
        "owner_id": user["id"],
        "game_name": game_name,
        "date": date,
        "language": language,
        "description": description,
        "status": status,
        "likes": 0,
        "liked_by": []
    }

    return jsonify({
        "message": "Game added",
        "game": public_game(games[game_id])
    }), 201


@app.route("/api/games/<game_id>", methods=["GET"])
def get_one_game(game_id):
    if game_id not in games:
        return jsonify({
            "message": "Game not found"
        }), 404

    return jsonify({
        "game": public_game(games[game_id])
    }), 200


@app.route("/api/games/<game_id>", methods=["PUT"])
def update_game(game_id):
    user = get_current_user()

    if not user:
        return jsonify({
            "message": "Unauthorized"
        }), 401

    if game_id not in games:
        return jsonify({
            "message": "Game not found"
        }), 404

    game = games[game_id]

    if game["owner_id"] != user["id"]:
        return jsonify({
            "message": "You can edit only your own game"
        }), 403

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "No JSON data"
        }), 400

    game["game_name"] = data.get("game_name", game["game_name"])
    game["date"] = data.get("date", game["date"])
    game["language"] = data.get("language", game["language"])
    game["description"] = data.get("description", game["description"])
    game["status"] = data.get("status", game["status"])

    return jsonify({
        "message": "Game updated",
        "game": public_game(game)
    }), 200


@app.route("/api/games/<game_id>", methods=["DELETE"])
def delete_game(game_id):
    user = get_current_user()

    if not user:
        return jsonify({
            "message": "Unauthorized"
        }), 401

    if game_id not in games:
        return jsonify({
            "message": "Game not found"
        }), 404

    game = games[game_id]

    if game["owner_id"] != user["id"]:
        return jsonify({
            "message": "You can delete only your own game"
        }), 403

    del games[game_id]

    return jsonify({
        "message": "Game deleted"
    }), 200


# # =========================
# # LIKE SYSTEM
# # =========================
#
# @app.route("/api/games/<game_id>/like", methods=["POST"])
# def like_game(game_id):
#     user = get_current_user()
#
#     if not user:
#         return jsonify({
#             "message": "Unauthorized"
#         }), 401
#
#     if game_id not in games:
#         return jsonify({
#             "message": "Game not found"
#         }), 404
#
#     game = games[game_id]
#
#     if user["id"] in game["liked_by"]:
#         return jsonify({
#             "message": "You already liked this game"
#         }), 409
#
#     game["liked_by"].append(user["id"])
#     game["likes"] += 1
#
#     return jsonify({
#         "message": "Game liked",
#         "likes": game["likes"]
#     }), 200
#
#
# @app.route("/api/games/<game_id>/unlike", methods=["POST"])
# def unlike_game(game_id):
#     user = get_current_user()
#
#     if not user:
#         return jsonify({
#             "message": "Unauthorized"
#         }), 401
#
#     if game_id not in games:
#         return jsonify({
#             "message": "Game not found"
#         }), 404
#
#     game = games[game_id]
#
#     if user["id"] not in game["liked_by"]:
#         return jsonify({
#             "message": "You did not like this game"
#         }), 409
#
#     game["liked_by"].remove(user["id"])
#     game["likes"] -= 1
#
#     return jsonify({
#         "message": "Game unliked",
#         "likes": game["likes"]
#     }), 200


# =========================
# MATCHING / RECOMMENDATIONS
# =========================

def calculate_match_score(my_profile, game):
    score = 0

    if my_profile.get("main_language") and my_profile["main_language"].lower() == game["language"].lower():
        score += 30

    description = game["description"].lower()
    nick = my_profile.get("nick", "").lower()

    if nick and nick in description:
        score += 5

    if game["status"] == "active":
        score += 20

    score += game["likes"] * 2

    return score


@app.route("/api/matches", methods=["GET"])
def get_matches():
    user = get_current_user()

    if not user:
        return jsonify({
            "message": "Unauthorized"
        }), 401

    my_profile = profiles[user["id"]]

    matches = []

    for game in games.values():
        if game["owner_id"] == user["id"]:
            continue

        score = calculate_match_score(my_profile, game)

        game_data = public_game(game)
        game_data["match_score"] = score

        matches.append(game_data)

    matches.sort(key=lambda item: item["match_score"], reverse=True)

    return jsonify({
        "matches": matches
    }), 200

if __name__ == "__main__":
    app.run(debug=True)