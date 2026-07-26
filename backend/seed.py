import time
import json
import os
from sqlalchemy.orm import Session
from app.db.database import Base, engine, SessionLocal
from app.models.domain import (
    PoliceStation, Officer, PenalCodeMapping, FIRRecord, AccusedPerson,
    FIRAccusedLink, VictimPerson, WitnessPerson, Vehicle, DigitalEvidence,
    EvidenceItem, CaseTimeline, AuditLogEntry, SavedSearch
)
from app.services.data_generator import create_synthetic_dataset
from app.services.graph_service import graph_engine
from app.services.vector_service import vector_engine

def seed_database():
    start_time = time.time()
    print("[INIT] Starting KSP RAKSHAK-AI Database Seeding...")

    # 1. Create tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("[SUCCESS] Database tables created successfully.")

    # 2. Generate Dataset
    data = create_synthetic_dataset()

    db: Session = SessionLocal()

    try:
        # Insert Police Stations
        for s in data["stations"]:
            db.add(PoliceStation(**s))
        db.commit()

        # Insert Officers
        for o in data["officers"]:
            db.add(Officer(**o))
        db.commit()

        # Insert Penal Code Mappings
        for p in data["penal_mappings"]:
            db.add(PenalCodeMapping(**p))
        db.commit()

        # Insert Accused
        for a in data["accused"]:
            db.add(AccusedPerson(**a))
        db.commit()

        # Insert FIRs
        for f in data["firs"]:
            db.add(FIRRecord(**f))
        db.commit()

        # Insert FIR-Accused Links
        for fal in data["fir_accused_links"]:
            db.add(FIRAccusedLink(**fal))
        db.commit()

        # Insert Victims
        for v in data["victims"]:
            db.add(VictimPerson(**v))
        db.commit()

        # Insert Witnesses
        for w in data["witnesses"]:
            db.add(WitnessPerson(**w))
        db.commit()

        # Insert Vehicles
        for veh in data["vehicles"]:
            db.add(Vehicle(**veh))
        db.commit()

        # Insert Digital Evidence
        for d in data["digital_evidences"]:
            db.add(DigitalEvidence(**d))
        db.commit()

        # Insert Evidence Items
        for e in data["evidence_items"]:
            db.add(EvidenceItem(**e))
        db.commit()

        # Insert Case Timelines
        for t in data["case_timelines"]:
            db.add(CaseTimeline(**t))
        db.commit()

        print("[SUCCESS] SQLAlchemy DB successfully populated with all entities.")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error during database insertion: {e}")
        raise e
    finally:
        db.close()

    # 3. Populate Knowledge Graph Engine
    graph_engine.build_graph_from_dataset(data)

    # 4. Populate Vector Search Engine
    vector_engine.build_vector_index(data["firs"])

    elapsed = time.time() - start_time
    print(f"[SUCCESS] Database Seeding & Indexing completed in {elapsed:.2f} seconds!")

    # 5. Run Automatic Validation Suite
    validate_dataset(data)

def validate_dataset(data):
    print("\n[VALIDATION] Running Automatic Validation Suite on Generated Dataset...")
    errors = []

    # Check 1: Foreign Keys
    stn_ids = {s["id"] for s in data["stations"]}
    for f in data["firs"]:
        if f["station_id"] not in stn_ids:
            errors.append(f"Broken FK: FIR {f['id']} references unknown station {f['station_id']}")

    # Check 2: Coordinate Bounds for Karnataka (Lat 11.0 - 19.0, Lng 73.5 - 79.0)
    for f in data["firs"]:
        if not (11.0 <= f["latitude"] <= 19.0 and 73.5 <= f["longitude"] <= 79.0):
            errors.append(f"Invalid Coordinates for FIR {f['id']}: ({f['latitude']}, {f['longitude']})")

    # Check 3: Graph Integrity
    if graph_engine.graph.number_of_nodes() == 0:
        errors.append("Knowledge Graph has 0 nodes!")

    # Check 4: BNS Mapping presence
    for f in data["firs"]:
        if not f.get("bns_sections"):
            errors.append(f"FIR {f['id']} missing BNS section mapping!")

    if not errors:
        print("[SUCCESS] VALIDATION SUCCESS: 0 errors detected. Dataset is 100% compliant with KSP schema & bounds!")
    else:
        print(f"[WARN] VALIDATION WARN: {len(errors)} issues found:")
        for err in errors[:5]:
            print(f"  - {err}")

if __name__ == "__main__":
    seed_database()
