import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON, Index
from sqlalchemy.orm import relationship
from app.db.database import Base

class PoliceStation(Base):
    __tablename__ = "police_stations"

    id = Column(String(50), primary_key=True)
    code = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    district = Column(String(50), nullable=False, index=True)
    range_zone = Column(String(50), nullable=False)
    subdivision = Column(String(50), nullable=False)
    circle = Column(String(50), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    contact_number = Column(String(20))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    officers = relationship("Officer", back_populates="station")
    firs = relationship("FIRRecord", back_populates="station")


class Officer(Base):
    __tablename__ = "officers"

    id = Column(String(50), primary_key=True)
    badge_number = Column(String(30), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    rank = Column(String(50), nullable=False) # Constable, PSI, DySP, SP, etc.
    station_id = Column(String(50), ForeignKey("police_stations.id"), nullable=False, index=True)
    role = Column(String(30), nullable=False, default="SHO_PSI")
    clearance_level = Column(Integer, default=2)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    station = relationship("PoliceStation", back_populates="officers")
    investigated_firs = relationship("FIRRecord", back_populates="io_officer")


class PenalCodeMapping(Base):
    __tablename__ = "penal_code_mappings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ipc_section = Column(String(30), nullable=False, index=True)
    bns_section = Column(String(30), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text)
    category = Column(String(50), nullable=False)


class FIRRecord(Base):
    __tablename__ = "fir_records"

    id = Column(String(50), primary_key=True)
    fir_no = Column(String(50), unique=True, nullable=False, index=True)
    station_id = Column(String(50), ForeignKey("police_stations.id"), nullable=False, index=True)
    io_officer_id = Column(String(50), ForeignKey("officers.id"), nullable=False, index=True)
    registration_date = Column(DateTime, nullable=False, index=True)
    incident_date = Column(DateTime, nullable=False)
    crime_head = Column(String(80), nullable=False, index=True)
    ipc_sections = Column(JSON, nullable=False) # List of strings e.g. ["IPC 379", "IPC 411"]
    bns_sections = Column(JSON, nullable=False) # List of strings e.g. ["BNS 303(2)"]
    
    mo_narrative = Column(Text, nullable=False)
    spot_mahazar = Column(Text)
    crime_scene_address = Column(String(200))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    status = Column(String(30), default="UNDER_INVESTIGATION", index=True) # PENDING, UNDER_INVESTIGATION, CHARGESHEETED, CLOSED
    is_sensitive = Column(Boolean, default=False) # POCSO, sexual assault etc.
    priority = Column(String(20), default="MEDIUM")
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    station = relationship("PoliceStation", back_populates="firs")
    io_officer = relationship("Officer", back_populates="investigated_firs")
    accused_links = relationship("FIRAccusedLink", back_populates="fir")
    victims = relationship("VictimPerson", back_populates="fir")
    witnesses = relationship("WitnessPerson", back_populates="fir")
    vehicles = relationship("Vehicle", back_populates="fir")
    digital_evidence = relationship("DigitalEvidence", back_populates="fir")
    evidence_items = relationship("EvidenceItem", back_populates="fir")
    timeline_events = relationship("CaseTimeline", back_populates="fir")


class AccusedPerson(Base):
    __tablename__ = "accused_persons"

    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False, index=True)
    alias = Column(String(100))
    age = Column(Integer)
    gender = Column(String(10))
    phone_number = Column(String(20), index=True)
    aadhaar_hash = Column(String(64))
    history_sheet_no = Column(String(50), index=True)
    known_mos = Column(JSON) # List of MO tags e.g. ["IRON_ROD_WINDOW", "SUNDAY_NIGHT"]
    address = Column(String(200))
    district = Column(String(50))
    gang_name = Column(String(80), index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    fir_links = relationship("FIRAccusedLink", back_populates="accused")


class FIRAccusedLink(Base):
    __tablename__ = "fir_accused_links"

    id = Column(Integer, primary_key=True, autoincrement=True)
    fir_id = Column(String(50), ForeignKey("fir_records.id"), nullable=False, index=True)
    accused_id = Column(String(50), ForeignKey("accused_persons.id"), nullable=False, index=True)
    relationship_type = Column(String(30), nullable=False) # NAMED, SUSPECT, ARRESTED, CHARGESHEETED

    fir = relationship("FIRRecord", back_populates="accused_links")
    accused = relationship("AccusedPerson", back_populates="fir_links")


class VictimPerson(Base):
    __tablename__ = "victim_persons"

    id = Column(String(50), primary_key=True)
    fir_id = Column(String(50), ForeignKey("fir_records.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer)
    gender = Column(String(10))
    phone_number = Column(String(20))
    address = Column(String(200))
    is_anonymized = Column(Boolean, default=False)

    fir = relationship("FIRRecord", back_populates="victims")


class WitnessPerson(Base):
    __tablename__ = "witness_persons"

    id = Column(String(50), primary_key=True)
    fir_id = Column(String(50), ForeignKey("fir_records.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    phone_number = Column(String(20))
    statement_summary = Column(Text)

    fir = relationship("FIRRecord", back_populates="witnesses")


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(String(50), primary_key=True)
    fir_id = Column(String(50), ForeignKey("fir_records.id"), nullable=False, index=True)
    registration_no = Column(String(30), nullable=False, index=True)
    make_model = Column(String(80), nullable=False)
    color = Column(String(30))
    chassis_no = Column(String(50))
    engine_no = Column(String(50))
    status = Column(String(30), default="STOLEN") # STOLEN, RECOVERED, USED_IN_CRIME

    fir = relationship("FIRRecord", back_populates="vehicles")


class DigitalEvidence(Base):
    __tablename__ = "digital_evidence"

    id = Column(String(50), primary_key=True)
    fir_id = Column(String(50), ForeignKey("fir_records.id"), nullable=False, index=True)
    evidence_type = Column(String(30), nullable=False, index=True) # PHONE, IMEI, BANK_ACCOUNT, UPI_ID, CDR
    value = Column(String(100), nullable=False, index=True)
    owner_name = Column(String(100))
    remarks = Column(Text)

    fir = relationship("FIRRecord", back_populates="digital_evidence")


class EvidenceItem(Base):
    __tablename__ = "evidence_items"

    id = Column(String(50), primary_key=True)
    fir_id = Column(String(50), ForeignKey("fir_records.id"), nullable=False, index=True)
    property_id = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50)) # WEAPON, CASH, JEWELLERY, ELECTRONICS
    seized_from = Column(String(100))
    seizure_date = Column(DateTime)

    fir = relationship("FIRRecord", back_populates="evidence_items")


class CaseTimeline(Base):
    __tablename__ = "case_timelines"

    id = Column(Integer, primary_key=True, autoincrement=True)
    fir_id = Column(String(50), ForeignKey("fir_records.id"), nullable=False, index=True)
    event_date = Column(DateTime, nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text)
    officer_name = Column(String(100))

    fir = relationship("FIRRecord", back_populates="timeline_events")


class AuditLogEntry(Base):
    __tablename__ = "audit_logs"

    id = Column(String(50), primary_key=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    user_id = Column(String(50), nullable=False, index=True)
    user_name = Column(String(100), nullable=False)
    role = Column(String(30), nullable=False)
    action = Column(String(100), nullable=False)
    query = Column(Text, nullable=False)
    records_accessed_count = Column(Integer, default=0)
    hash = Column(String(64), nullable=False)
    previous_hash = Column(String(64), nullable=False)


class SavedSearch(Base):
    __tablename__ = "saved_searches"

    id = Column(String(50), primary_key=True)
    user_id = Column(String(50), nullable=False, index=True)
    title = Column(String(100), nullable=False)
    query_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
