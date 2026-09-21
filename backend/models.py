from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from database import Base

class LeakedSecret(Base):
    __tablename__ = "leaked_secrets"

    id = Column(Integer, primary_key=True, index=True)
    secret_type = Column(String, index=True)
    masked_value = Column(String)
    line_number = Column(Integer)
    detected_at = Column(DateTime, default=datetime.now)
