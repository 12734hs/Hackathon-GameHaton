from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from models import db, User, Language  # Sourced from your database models

# Create Blueprint for Authentication module
auth_bp = Blueprint('auth', __name__)

# Secret key used to sign JWT tokens securely
SECRET_KEY = "gamer_matchmaking_vibe_secret_key"


# =======================================================
# 🔒 TOKEN VALIDATION DECORATOR (MIDDLEWARE)
# =======================================================
def token_required(f):
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"error": "Authentication token is missing!"}), 401
        try:
            if "Bearer " in token:
                token = token.split(" ")[1]
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({"error": "User not found!"}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired! Please login again."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token!"}), 401
        
        return f(current_user, *args, **kwargs)
    decorated.__name__ = f.__name__
    return decorated


# =======================================================
# 1. REGISTER ENDPOINT (User Signup)
# =======================================================
@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['nickname', 'email', 'password', 'age']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Check if email is unique (Nickname is allowed to be duplicated)
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({"error": "This email is already registered!"}), 400

        # Secure password hashing
        hashed_password = generate_password_hash(data['password'], method='scrypt')

        # Create new user object
        new_user = User(
            nickname=data['nickname'],
            email=data['email'],
            password_hash=hashed_password,
            age=int(data['age']),
            discord_link=""  # Left empty initially, will be filled in the profile update
        )

        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "Registration successful! Please log in to complete your profile."}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


# =======================================================
# 2. LOGIN ENDPOINT (User Sign In)
# =======================================================
@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"error": "Email and password are required!"}), 400

        user = User.query.filter_by(email=data['email']).first()

        # Verify user credentials
        if user and check_password_hash(user.password_hash, data['password']):
            token_payload = {
                'user_id': str(user.id),
                'nickname': user.nickname,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }
            token = jwt.encode(token_payload, SECRET_KEY, algorithm="HS256")

            return jsonify({
                "message": "Login successful!",
                "token": token
            }), 200

        return jsonify({"error": "Invalid email or password!"}), 401

    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


# =======================================================
# 3. PROFILE UPDATE ENDPOINT (Update Profile and Languages)
# =======================================================
@auth_bp.route('/profile/update', methods=['PUT'])
@token_required
def update_profile(current_user):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided for update!"}), 400

        # Update customizable nickname
        if 'nickname' in data:
            current_user.nickname = data['nickname']

        # Update social links and demographics
        if 'discord_link' in data:
            current_user.discord_link = data['discord_link']
        if 'steam_link' in data:
            current_user.steam_link = data['steam_link']
        if 'epic_link' in data:
            current_user.epic_link = data['epic_link']
        if 'age' in data:
            current_user.age = int(data['age'])

        # Handle Many-to-Many updates for selected languages
        if 'languages' in data and isinstance(data['languages'], list):
            current_user.languages.clear()  # Clear existing relationship entries
            
            for lang_id in data['languages']:
                language = Language.query.get(lang_id)
                if language:
                    current_user.languages.append(language)

        db.session.commit()
        return jsonify({"message": "Profile updated successfully!"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Update failed: {str(e)}"}), 500


# =======================================================
# 4. GET LANGUAGES ENDPOINT (Fetch Supported Languages)
# =======================================================
@auth_bp.route('/languages', methods=['GET'])
def get_languages():
    try:
        langs = Language.query.all()
        output = []
        for lang in langs:
            output.append({
                'id': lang.id,
                'lang_name': lang.lang_name,
                'lang_code': lang.lang_code
            })
        return jsonify({"languages": output}), 200
    except Exception as e:
        return jsonify({"error": f"Could not fetch languages: {str(e)}"}), 500