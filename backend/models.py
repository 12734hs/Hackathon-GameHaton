from flask_sqlalchemy import SQLAlchemy
import uuid
import datetime

db = SQLAlchemy()

# =======================================================
# 🔗 MANY-TO-MANY LINK TABLES
# =======================================================

# Link table between Users and Languages (Many-to-Many)
user_languages = db.Table(
    'user_languages',
    db.Column('user_id', db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    db.Column('language_id', db.Integer, db.ForeignKey('languages.id', ondelete='CASCADE'), primary_key=True)
)

# Link table between Users and Rooms (Many-to-Many - Tracks users currently inside a room)
room_participants = db.Table(
    'room_participants',
    db.Column('room_id', db.UUID(as_uuid=True), db.ForeignKey('rooms.id', ondelete='CASCADE'), primary_key=True),
    db.Column('user_id', db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
)


# =======================================================
# 🗂️ DATABASE MODELS
# =======================================================

class Language(db.Model):
    __tablename__ = 'languages'
    
    id = db.Column(db.Integer, primary_key=True)
    lang_name = db.Column(db.String(50), unique=True, nullable=False)
    lang_code = db.Column(db.String(10), unique=True, nullable=False)


class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nickname = db.Column(db.String(50), nullable=False)  # Not unique, as requested
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    discord_link = db.Column(db.String(150), nullable=False)
    steam_link = db.Column(db.String(150), nullable=True)
    epic_link = db.Column(db.String(150), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    languages = db.relationship('Language', secondary=user_languages, backref=db.backref('users', lazy='dynamic'))


class Room(db.Model):
    __tablename__ = 'rooms'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = db.Column(db.String(100), nullable=False)
    game_name = db.Column(db.String(100), nullable=False)
    max_players = db.Column(db.Integer, nullable=False, default=4)
    min_age = db.Column(db.Integer, nullable=True)
    max_age = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    status = db.Column(db.String(20), nullable=False, default='active')
    
    # Foreign Keys
    creator_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    language_id = db.Column(db.Integer, db.ForeignKey('languages.id', ondelete='RESTRICT'), nullable=False)
    
    # Relationships
    creator = db.relationship('User', backref=db.backref('created_rooms', lazy='dynamic'))
    language = db.relationship('Language', backref=db.backref('rooms', lazy='dynamic'))
    participants = db.relationship('User', secondary=room_participants, backref=db.backref('joined_rooms', lazy='dynamic'))


class Message(db.Model):
    __tablename__ = 'messages'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content = db.Column(db.Text, nullable=False)
    sent_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Foreign Keys
    room_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('rooms.id', ondelete='CASCADE'), nullable=False)
    sender_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    
    # Relationships
    room = db.relationship('Room', backref=db.backref('messages', cascade="all, delete-orphan", lazy='dynamic'))
    sender = db.relationship('User', backref=db.backref('messages', lazy='dynamic'))