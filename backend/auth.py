from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User

# Blueprint yaradırıq. Bu, app.py-a qoşulacaq bir alt moduldur.
auth_bp = Blueprint('auth', __name__)

def public_user(user):
    return {
        "id": str(user.id),
        "nickname": user.nickname,
        "email": user.email,
        "age": user.age,
        "discord_link": user.discord_link,
        "steam_link": user.steam_link,
        "epic_link": user.epic_link
    }

@auth_bp.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("nickname") or not data.get("password"):
        return jsonify({"message": "Required fields missing"}), 400

    if User.query.filter_by(email=data.get("email")).first():
        return jsonify({"message": "User already exists"}), 409

    new_user = User(
        nickname=data.get("nickname"),
        email=data.get("email"),
        password_hash=generate_password_hash(data.get("password")),
        age=int(data.get("age")),
        discord_link=data.get("discord", ""),
        steam_link=data.get("steam", ""),
        epic_link=data.get("epic", "")
    )
    db.session.add(new_user)
    db.session.commit()
    
    session["user_id"] = str(new_user.id)
    return jsonify({"message": "Registration successful", "user": public_user(new_user)}), 201

@auth_bp.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(email=data.get("email")).first()
    if not user or not check_password_hash(user.password_hash, data.get("password")):
        return jsonify({"message": "Wrong credentials"}), 401
        
    session["user_id"] = str(user.id)
    return jsonify({"message": "Login successful", "user": public_user(user)}), 200

@auth_bp.route("/api/auth/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)
    return jsonify({"message": "Logout successful"}), 200

@auth_bp.route("/api/auth/me", methods=["GET"])
def me():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"logged_in": False, "user": None}), 401
        
    user = User.query.get(user_id)
    return jsonify({"logged_in": True, "user": public_user(user)}), 200