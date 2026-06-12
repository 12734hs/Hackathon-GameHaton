from flask_sqlalchemy import SQLAlchemy
import uuid
from datetime import datetime

db = SQLAlchemy()

def generate_uuid():
    return str(uuid.uuid4())

# 🤝 İstifadəçilər və Dillər arasında əlaqə cədvəli (Many-to-Many)
user_languages = db.Table('user_languages',
    db.Column('user_id', db.String(50), db.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    db.Column('language_id', db.Integer, db.ForeignKey('languages.id', ondelete='CASCADE'), primary_key=True)
)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(50), primary_key=True, default=generate_uuid)
    nickname = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    steam = db.Column(db.String(255), default="")
    epic = db.Column(db.String(255), default="")
    discord = db.Column(db.String(255), default="")
    description = db.Column(db.Text, default="")
    
    # 🎯 İstifadəçinin bildiyi bütün dillərin siyahısı
    languages = db.relationship('Language', secondary=user_languages, backref=db.backref('users', lazy='dynamic'))

class Language(db.Model):
    __tablename__ = 'languages'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), unique=True, nullable=False)  # Məs: "Azerbaijani", "English"

class Room(db.Model):
    __tablename__ = 'rooms'
    id = db.Column(db.String(50), primary_key=True, default=generate_uuid)
    host_id = db.Column(db.String(50), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    game_name = db.Column(db.String(100), nullable=False)
    language = db.Column(db.String(50), nullable=False)  # Otağın dili (Məs: "English")
    description = db.Column(db.Text, nullable=False)
    min_age = db.Column(db.Integer, default=0)
    max_age = db.Column(db.Integer, default=99)
    max_players = db.Column(db.Integer, default=5)

class Message(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    room_id = db.Column(db.String(50), db.ForeignKey('rooms.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)