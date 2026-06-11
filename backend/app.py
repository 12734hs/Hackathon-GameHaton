import os
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from models import db, User, Room, Message, Language
from auth import auth_bp
from datetime import datetime

def create_app():
    app = Flask(__name__)
    app.secret_key = "dev-secret-key"
    CORS(app, supports_credentials=True)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:1234@localhost:5432/gamer_matchmaking'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    app.register_blueprint(auth_bp)
    return app

app = create_app()

def public_room(room):
    return {
        "id": room.id, 
        "host_id": room.host_id, 
        "game_name": room.game_name,
        "language": room.language, 
        "description": room.description,
        "min_age": room.min_age, 
        "max_age": room.max_age, 
        "max_players": room.max_players,
        "game_start_time": room.game_start_time.strftime("%Y-%m-%d %H:%M:%S"),
        "game_end_time": room.game_end_time.strftime("%Y-%m-%d %H:%M:%S")
    }
@app.route("/api/rooms", methods=["GET"])
def get_all_rooms():
    rooms = Room.query.all()
    return jsonify({"rooms": [public_room(r) for r in rooms]}), 200

@app.route("/api/rooms", methods=["POST"])
def create_room():
    user_id = session.get("user_id")
    if not user_id: return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json()
    if not data or not data.get("game_name") or not data.get("language") or not data.get("description"):
        return jsonify({"message": "Missing required fields"}), 400

    new_room = Room(
        host_id=user_id, 
        game_name=data.get("game_name"), 
        language=data.get("language"),
        description=data.get("description"), 
        min_age=int(data.get("min_age", 0)),
        max_age=int(data.get("max_age", 99)), 
        max_players=int(data.get("max_players", 5)),
        # Yeni sahələr əlavə olundu:
        game_start_time=datetime.fromisoformat(data.get("game_start_time")),
        game_end_time=datetime.fromisoformat(data.get("game_end_time"))
    )
    db.session.add(new_room)
    db.session.commit()
    return jsonify({"message": "Room created successfully", "room": public_room(new_room)}), 201

# ==========================================
# 🎯 MATCH SYSTEM (ÇOXLU DİLƏ GÖRƏ FİLTR)
# ==========================================
@app.route("/api/matches", methods=["GET"])
def get_matches():
    user_id = session.get("user_id")
    if not user_id: return jsonify({"message": "Unauthorized"}), 401

    user = User.query.get(user_id)
    user_lang_names = [lang.name.lower() for lang in user.languages]

    if not user_lang_names:
        return jsonify({"message": "Please add at least one language to your profile"}), 400

    # Yaş şərtinə və öz otağı olmamaq şərtinə görə ilkin filtr
    possible_rooms = Room.query.filter(
        Room.host_id != user.id,
        Room.min_age <= user.age,
        Room.max_age >= user.age
    ).all()

    # İndi isə otağın dilinin istifadəçinin dillər massivində olub-olmamasını yoxlayırıq
    matched_rooms = [r for r in possible_rooms if r.language.lower() in user_lang_names]

    return jsonify({"matches": [public_room(r) for r in matched_rooms]}), 200

# ==========================================
# 🚪 OTAĞA QOŞULMA (JOIN ROOM)
# ==========================================
@app.route("/api/rooms/<room_id>/join", methods=["POST"])
def join_room_action(room_id):
    user_id = session.get("user_id")
    if not user_id: return jsonify({"message": "Unauthorized"}), 401
    
    user = User.query.get(user_id)
    # Sistem mesajı olaraq yazırıq ki, kimin gəldiyini izləyə bilək
    system_msg = Message(room_id=room_id, user_id=user_id, content=f"__JOINED__{user.nickname}")
    db.session.add(system_msg)
    db.session.commit()
    
    return jsonify({"message": "Joined successfully"}), 200

# İndi get_room_details-i belə dəyişirik ki, siyahını da qaytarsın:
@app.route("/api/rooms/<room_id>", methods=["GET"])
def get_room_details(room_id):
    room = Room.query.get(room_id)
    if not room: return jsonify({"message": "Room not found"}), 404
    
    messages = Message.query.filter_by(room_id=room_id).order_by(Message.created_at.asc()).all()
    
    active_users = set()
    chat_messages = []
    
    for msg in messages:
        user = User.query.get(msg.user_id)
        nickname = user.nickname if user else "Unknown"
        
        if msg.content.startswith("__JOINED__"):
            active_users.add(nickname)
        else:
            chat_messages.append({"nickname": nickname, "content": msg.content})
            active_users.add(nickname)
            
    return jsonify({
        "room": public_room(room),
        "members": list(active_users),
        "messages": chat_messages
    }), 200
# =========================
# CHAT / MESSAGES API
# =========================
@app.route("/api/rooms/<room_id>/messages", methods=["POST"])
def send_message(room_id):
    user_id = session.get("user_id")
    if not user_id: return jsonify({"message": "Unauthorized"}), 401
    room = Room.query.get(room_id)
    if not room: return jsonify({"message": "Room not found"}), 404

    data = request.get_json()
    if not data or not data.get("content"):
        return jsonify({"message": "Message content cannot be empty"}), 400

    new_msg = Message(room_id=room_id, user_id=user_id, content=data.get("content"))
    db.session.add(new_msg)
    db.session.commit()

    user = User.query.get(user_id)
    return jsonify({
        "message": "Message sent",
        "data": {
            "id": new_msg.id, "room_id": new_msg.room_id, "nickname": user.nickname,
            "content": new_msg.content, "created_at": new_msg.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }
    }), 201

@app.route("/api/rooms/<room_id>/messages", methods=["GET"])
def get_room_messages(room_id):
    room = Room.query.get(room_id)
    if not room: return jsonify({"message": "Room not found"}), 404

    messages = Message.query.filter_by(room_id=room_id).order_by(Message.created_at.asc()).all()
    result = []
    for msg in messages:
        user = User.query.get(msg.user_id)
        result.append({
            "id": msg.id, "user_id": msg.user_id, "nickname": user.nickname if user else "Unknown Gamer",
            "content": msg.content, "created_at": msg.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })
    return jsonify({"messages": result}), 200

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)