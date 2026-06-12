from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Language

auth_bp = Blueprint('auth', __name__)

def public_user(user):
    return {
        "id": user.id,
        "email": user.email,
        "nickname": user.nickname,
        "age": user.age,
        "languages": [lang.name for lang in user.languages]  # Dilləri siyahı kimi qaytarır
    }

def public_profile(user):
    return {
        "user_id": user.id,
        "email": user.email,
        "nickname": user.nickname,
        "age": user.age,
        "languages": [lang.name for lang in user.languages],
        "steam": user.steam,
        "epic": user.epic,
        "discord": user.discord,
        "description": user.description
    }

@auth_bp.route("/api/auth/register", methods=["POST"])
@auth_bp.route("/api/auth/signup", methods=["POST"])
def register():
    data = request.get_json()
    if not data: return jsonify({"message": "No JSON data"}), 400
    
    email, nickname, age, password = data.get("email"), data.get("nickname"), data.get("age"), data.get("password")
    lang_names = data.get("languages", [])  # Məsələn: ["Azerbaijani", "English"]

    if not email or not nickname or not age or not password or not lang_names:
        return jsonify({"message": "Required fields missing (email, nickname, password, age, languages)"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User already exists"}), 409

    new_user = User(email=email, nickname=nickname, age=int(age), password_hash=generate_password_hash(password))

    # Dilləri bazada tapıb istifadəçiyə bağlayırıq (yoxdursa avtomatik yaradır)
    for name in lang_names:
        lang = Language.query.filter_by(name=name).first()
        if not lang:
            lang = Language(name=name)
            db.session.add(lang)
        new_user.languages.append(lang)

    db.session.add(new_user)
    db.session.commit()

    session["user_id"] = new_user.id
    return jsonify({"message": "Registration successful", "user": public_user(new_user)}), 201

@auth_bp.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(email=data.get("email")).first()
    if not user or not check_password_hash(user.password_hash, data.get("password")):
        return jsonify({"message": "Wrong credentials"}), 401

    session["user_id"] = user.id
    return jsonify({"message": "Login successful", "user": public_user(user)}), 200

@auth_bp.route("/api/auth/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)
    return jsonify({"message": "Logout successful"}), 200

@auth_bp.route("/api/auth/me", methods=["GET"])
def me():
    user_id = session.get("user_id")
    if not user_id: return jsonify({"logged_in": False, "user": None}), 401
    user = User.query.get(user_id)
    return jsonify({"logged_in": True, "user": public_user(user)}), 200

@auth_bp.route("/api/profile/me", methods=["PUT"])
def update_my_profile():
    user_id = session.get("user_id")
    if not user_id: return jsonify({"message": "Unauthorized"}), 401

    user = User.query.get(user_id)
    data = request.get_json()
    
    user.nickname = data.get("nickname", user.nickname)
    user.age = int(data.get("age", user.age))
    user.steam = data.get("steam", user.steam)
    user.epic = data.get("epic", user.epic)
    user.discord = data.get("discord", user.discord)
    user.description = data.get("description", user.description)

    # Dillər yenilənirsə
    if "languages" in data:
        user.languages = []
        for name in data.get("languages"):
            lang = Language.query.filter_by(name=name).first()
            if not lang:
                lang = Language(name=name)
                db.session.add(lang)
            user.languages.append(lang)

    db.session.commit()
    return jsonify({"message": "Profile updated", "profile": public_profile(user)}), 200