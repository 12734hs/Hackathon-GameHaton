import uuid
import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# 🔗 Many-to-Many: user_languages
user_languages = db.Table(
    'user_languages',
    db.Column('user_id', db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    db.Column('language_id', db.Integer, db.ForeignKey('languages.id', ondelete='CASCADE'), primary_key=True)
)

# 🔗 Many-to-Many: room_members
room_members = db.Table(
    'room_members',
    db.Column('room_id', db.UUID(as_uuid=True), db.ForeignKey('rooms.id', ondelete='CASCADE'), primary_key=True),
    db.Column('user_id', db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    db.Column('joined_at', db.DateTime, default=datetime.datetime.utcnow)
)

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nickname = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    discord_link = db.Column(db.String(150), nullable=True)
    steam_link = db.Column(db.String(150), nullable=True)
    epic_link = db.Column(db.String(150), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    languages = db.relationship('Language', secondary=user_languages, backref=db.backref('users', lazy='dynamic'))

class Language(db.Model):
    __tablename__ = 'languages'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    lang_name = db.Column(db.String(250), unique=True, nullable=False)
    lang_code = db.Column(db.String(10), unique=True, nullable=False)

class Room(db.Model):
    __tablename__ = 'rooms'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    description = db.Column(db.Text, nullable=True)
    game_name = db.Column(db.String(100), nullable=False)
    game_start_time = db.Column(db.DateTime, nullable=False)
    game_end_time = db.Column(db.DateTime, nullable=False)
    min_age = db.Column(db.Integer, default=0)
    max_age = db.Column(db.Integer, default=99)
    max_players = db.Column(db.Integer, nullable=False, default=5)
    status = db.Column(db.String(20), default='active') # Sənin yazdığın status məntiqi
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Foreign Keys
    host_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    
    # Relationships
    host = db.relationship('User', backref=db.backref('hosted_rooms', lazy='dynamic'))
    members = db.relationship('User', secondary=room_members, backref=db.backref('joined_rooms', lazy='dynamic'))

class Message(db.Model):
    __tablename__ = 'messages'
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_text = db.Column(db.Text, nullable=False)
    sent_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Foreign Keys
    room_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('rooms.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    
    # Relationships
    room = db.relationship('Room', backref=db.backref('messages', lazy='dynamic'))
    user = db.relationship('User', backref=db.backref('messages', lazy='dynamic'))
    