import os
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from sqlalchemy import text
from datetime import datetime
from models import db, User, Room, Language, Message
from auth import auth_bp  # Yeni yaratdığımız auth faylını bura çağırırıq

def create_app():
    app = Flask(__name__)
    app.secret_key = "dev-secret-key"
    CORS(app, supports_credentials=True)

    # Verilənlər bazası bağlantısı (Şifrəni özünkü ilə əvəzlə)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:1234@localhost:5432/gamer_matchmaking'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    # 🌟 BLUEPRINT QOŞULMASI: Auth endpointləri artıq buraya bağlandı
    app.register_blueprint(auth_bp)

    return app

app = create_app()

def init_db_from_sql():
    """Reads database/init.sql and runs it cleanly on your PostgreSQL instance"""
    sql_file_path = os.path.join(os.path.dirname(__file__), 'database', 'init.sql')
    if not os.path.exists(sql_file_path):
        print(f"⚠️ Warning: Missing SQL file at {sql_file_path}")
        return

    print("🚀 Running custom init.sql configuration script...")
    
    # 🌟 FIX: Wrap the ENTIRE logic, including try/except, inside the app_context
    with app.app_context():
        try:
            with open(sql_file_path, 'r', encoding='utf-8') as f:
                sql_script = f.read()
            db.session.execute(text(sql_script))
            db.session.commit()
            print("✅ Database successfully structured from init.sql!")
        except Exception as e:
            db.session.rollback()  # Now Flask context is active here, so no more RuntimeError!
            print(f"❌ Initialization error encountered: {e}")

def get_current_user():
    user_id = session.get("user_id")
    if not user_id:
        return None
    return User.query.get(user_id)

# 🎮 ROOMS API 
@app.route("/api/rooms", methods=["POST"])
def create_room():
    user = get_current_user()
    if not user:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json()
    try:
        start_time = datetime.strptime(data.get("game_start_time"), "%Y-%m-%d %H:%M:%S")
        end_time = datetime.strptime(data.get("game_end_time"), "%Y-%m-%d %H:%M:%S")
    except:
        return jsonify({"message": "Invalid date format. Use YYYY-MM-DD HH:MM:SS"}), 400

    new_room = Room(
        description=data.get("description", ""),
        game_name=data.get("game_name"),
        game_start_time=start_time,
        game_end_time=end_time,
        min_age=data.get("min_age", 0),
        max_age=data.get("max_age", 99),
        max_players=data.get("max_players", 5),
        host_id=user.id
    )
    db.session.add(new_room)
    db.session.commit()
    return jsonify({"message": "Room created successfully!", "room_id": str(new_room.id)}), 201

if __name__ == "__main__":
    init_db_from_sql()
    app.run(debug=True, port=5000)