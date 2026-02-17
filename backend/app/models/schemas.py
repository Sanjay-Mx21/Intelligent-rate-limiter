from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from datetime import datetime
from .database import Base


class RequestLog(Base):
    """Store all rate limiter requests for analytics"""
    __tablename__ = "request_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    endpoint = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    allowed = Column(Boolean, nullable=False)
    response_time_ms = Column(Float, nullable=False)
    algorithm = Column(String, nullable=False)  # token_bucket, sliding_window, etc.
    
    def __repr__(self):
        return f"<RequestLog(user_id={self.user_id}, allowed={self.allowed})>"