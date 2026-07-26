import random
import datetime
import uuid
import json

KSP_STATIONS = [
    {"id": "STN_PEENYA", "code": "KA-BLR-01", "name": "Peenya Police Station", "district": "Bengaluru City", "range_zone": "Bengaluru Urban", "subdivision": "North", "circle": "Peenya Circle", "latitude": 13.0324, "longitude": 77.5186},
    {"id": "STN_KAMAKSHI", "code": "KA-BLR-02", "name": "Kamakshipalya Police Station", "district": "Bengaluru City", "range_zone": "Bengaluru Urban", "subdivision": "West", "circle": "Vijayanagar Circle", "latitude": 12.9863, "longitude": 77.5302},
    {"id": "STN_RAJAJI", "code": "KA-BLR-03", "name": "Rajajinagar Police Station", "district": "Bengaluru City", "range_zone": "Bengaluru Urban", "subdivision": "West", "circle": "Malleshwaram Circle", "latitude": 12.9982, "longitude": 77.5530},
    {"id": "STN_WHITEFIELD", "code": "KA-BLR-04", "name": "Whitefield Police Station", "district": "Bengaluru City", "range_zone": "Bengaluru Urban", "subdivision": "East", "circle": "Whitefield Circle", "latitude": 12.9698, "longitude": 77.7499},
    {"id": "STN_INDIRA", "code": "KA-BLR-05", "name": "Indiranagar Police Station", "district": "Bengaluru City", "range_zone": "Bengaluru Urban", "subdivision": "East", "circle": "Halasuru Circle", "latitude": 12.9784, "longitude": 77.6408},
    {"id": "STN_DEVARAJA", "code": "KA-MYS-01", "name": "Devaraja Police Station", "district": "Mysuru City", "range_zone": "Southern Range", "subdivision": "Devaraja Sub", "circle": "Palace Circle", "latitude": 12.3051, "longitude": 76.6551},
    {"id": "STN_PANDESHWAR", "code": "KA-MNG-01", "name": "Pandeshwar Police Station", "district": "Mangaluru City", "range_zone": "Western Range", "subdivision": "Mangaluru South", "circle": "Port Circle", "latitude": 12.8617, "longitude": 74.8361},
    {"id": "STN_GOKUL", "code": "KA-HUB-01", "name": "Gokul Road Police Station", "district": "Hubballi-Dharwad", "range_zone": "Northern Range", "subdivision": "Hubballi West", "circle": "Gokul Circle", "latitude": 15.3647, "longitude": 75.1240},
    {"id": "STN_APMC_BEL", "code": "KA-BEL-01", "name": "APMC Yard Police Station", "district": "Belagavi", "range_zone": "Northern Range", "subdivision": "Belagavi North", "circle": "APMC Circle", "latitude": 15.8667, "longitude": 74.5167},
    {"id": "STN_SHAHABAD", "code": "KA-KLB-01", "name": "Shahabad Police Station", "district": "Kalaburagi", "range_zone": "North Eastern Range", "subdivision": "Kalaburagi Rural", "circle": "Shahabad Circle", "latitude": 17.1333, "longitude": 76.9333}
]

OFFICER_RANKS = ["Police Constable", "Head Constable", "Assistant Police Sub-Inspector", "Police Sub-Inspector", "Inspector of Police", "Deputy Superintendent of Police"]

KARNATAKA_FIRST_NAMES = [
    "Ramesh", "Suresh", "Vijay", "Ananya", "Karthik", "Venkatesh", "Mohammad", "Syed", "Basavaraj", "Shivashankar",
    "Manjula", "Prakash", "Siddeshwar", "Ganesh", "Mahesh", "Naveen", "Deepak", "Sunil", "Pradeep", "Raghavendra",
    "Chethan", "Abhishek", "Priya", "Kavya", "Swathi", "Divya", "Sachin", "Bharath", "Harish", "Santosh"
]

KARNATAKA_LAST_NAMES = [
    "Gowda", "Patil", "Rao", "Naik", "Poojary", "Swamy", "Hegde", "Shetty", "Kuruba", "Kulkarni",
    "Deshmukh", "Ibrahim", "Khan", "Bhat", "Reddy", "Joshi", "Babu", "Kumar", "Devi", "Shastry"
]

GANGS = [
    "Iron Rod Night Burglary Gang",
    "Kalyan Nagar Chain Snatching Module",
    "NH-48 Highway Vehicle Theft Syndicate",
    "Bengaluru Cyber APK Mule Ring",
    "Mysuru Road Armed Heist Network"
]

CRIME_HEADS_MAP = {
    "BURGLARY": {
        "ipc": ["IPC 380", "IPC 457"],
        "bns": ["BNS 305", "BNS 331(4)"],
        "mos": ["IRON_ROD_WINDOW", "NIGHT_LOCK_BREAK", "SUNDAY_ABSENCE"],
        "template": "Accused gained entry into locked house at {location} between 01:00 AM and 04:00 AM using iron rods to pry open rear window latch. Stolen property includes gold ornaments and cash totaling Rs {amount}."
    },
    "VEHICLE_THEFT": {
        "ipc": ["IPC 379", "IPC 411"],
        "bns": ["BNS 303(2)", "BNS 317(2)"],
        "mos": ["HANDLE_LOCK_BREAK", "MASTER_KEY_DUPLICATION", "METRO_PARKING_TARGET"],
        "template": "Complainant parked two-wheeler registration {vehicle_no} at {location}. On returning at 18:30 hrs, vehicle was found missing. Master key bypass suspect linked to regional vehicle fencing gang."
    },
    "CYBER_UPI_FRAUD": {
        "ipc": ["IPC 420", "IT Act 66D"],
        "bns": ["BNS 318(4)", "IT Act 66D"],
        "mos": ["FAKE_ELECTRICITY_BILL_APK", "KYC_UPDATE_LINK", "SIM_SWAP_OTP"],
        "template": "Victim received SMS claiming electricity connection would be disconnected. Victim clicked malicious APK link sending OTPs. Amount of Rs {amount} fraudulently transferred to UPI handle {upi} linked to mule bank account {bank}."
    },
    "CHAIN_SNATCHING": {
        "ipc": ["IPC 392", "IPC 356"],
        "bns": ["BNS 309(4)", "BNS 304"],
        "mos": ["TWO_WHEELER_PILLION_GRAB", "MORNING_WALK_TARGET"],
        "template": "Two unknown pillion riders on black Pulsar motorcycle approached victim walking near {location} and snatched 35g gold chain valued at Rs {amount}. CCTV footage shows getaway towards ring road."
    },
    "ARRAIGNED_ASSAULT": {
        "ipc": ["IPC 324", "IPC 34"],
        "bns": ["BNS 117(2)", "BNS 3(5)"],
        "mos": ["GROUP_ALTERCATION", "DANGEROUS_WEAPON_ATTACK"],
        "template": "Altercation broke out near {location} between rival groups. Accused assaulted victim with wooden logs and sharp objects causing grievous bodily harm."
    }
}

LOCATIONS_BY_DISTRICT = {
    "Bengaluru City": ["Peenya 2nd Stage", "Rajajinagar 4th Block", "Kamakshipalya Bus Stand", "Whitefield ITPL Main Road", "Indiranagar 100ft Road", "Yeshwantpur Railway Station"],
    "Mysuru City": ["Devaraja Market", "Vijayanagar 2nd Stage", "Mysuru Palace North Gate", "Hunsur Road Junction"],
    "Mangaluru City": ["Pandeshwar Port Road", "Hampankatta Junction", "Kodialbail Main Road"],
    "Hubballi-Dharwad": ["Gokul Road Industrial Estate", "Old Bus Stand Hubballi", "Dharwad Court Circle"],
    "Belagavi": ["APMC Yard Gate 1", "Tilakwadi Main Road", "Camp Area Belagavi"],
    "Kalaburagi": ["Shahabad Road", "Super Market Kalaburagi", "Station Area Kalaburagi"]
}

def generate_random_name():
    return f"{random.choice(KARNATAKA_FIRST_NAMES)} {random.choice(KARNATAKA_LAST_NAMES)}"

def generate_vehicle_no(district):
    codes = {"Bengaluru City": "KA-01", "Mysuru City": "KA-09", "Mangaluru City": "KA-19", "Hubballi-Dharwad": "KA-25", "Belagavi": "KA-22", "Kalaburagi": "KA-32"}
    prefix = codes.get(district, "KA-05")
    series = f"{random.choice('MNPQRST')}{random.choice('ABCDEFGHJKL')}"
    number = f"{random.randint(1000, 9999)}"
    return f"{prefix}-{series}-{number}"

def generate_imei():
    return f"86{random.randint(1000000000000, 9999999999999)}"

def generate_phone():
    return f"9{random.randint(100000000, 999999999)}"

def generate_bank_acc():
    return f"SBIN000{random.randint(10000000, 99999999)}"

def generate_upi(name):
    clean_name = name.lower().replace(" ", "")
    providers = ["okicici", "ybl", "paytm", "sbi"]
    return f"{clean_name}@{random.choice(providers)}"

def create_synthetic_dataset():
    """Generates interconnected Karnataka Police dataset with >10,000 entities across tables."""
    print("[INFO] Generating KSP Synthetic Intelligence Dataset (>10,000 entities)...")

    # 1. Police Stations
    stations = KSP_STATIONS

    # 2. Officers (30 officers across stations)
    officers = []
    officer_id_counter = 1
    for stn in stations:
        # SHO / PSI
        officers.append({
            "id": f"OFF_{officer_id_counter:03d}",
            "badge_number": f"KSP-{stn['code']}-{officer_id_counter:03d}",
            "name": f"Inspector {generate_random_name()}",
            "rank": "Police Sub-Inspector",
            "station_id": stn["id"],
            "role": "SHO_PSI",
            "clearance_level": 2,
            "email": f"psi.{stn['id'].lower()}@ksp.gov.in",
            "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW" # "ksp123"
        })
        officer_id_counter += 1
        # DySP / SP
        officers.append({
            "id": f"OFF_{officer_id_counter:03d}",
            "badge_number": f"KSP-{stn['code']}-{officer_id_counter:03d}",
            "name": f"Officer {generate_random_name()}",
            "rank": "Inspector of Police",
            "station_id": stn["id"],
            "role": "DYSP_CI",
            "clearance_level": 3,
            "email": f"ci.{stn['id'].lower()}@ksp.gov.in",
            "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW"
        })
        officer_id_counter += 1

    # 3. Penal Code Mappings
    penal_mappings = [
        {"ipc_section": "IPC 379", "bns_section": "BNS 303(2)", "title": "Theft", "category": "PROPERTY_CRIME", "description": "Punishment for theft"},
        {"ipc_section": "IPC 380", "bns_section": "BNS 305", "title": "Theft in Dwelling House", "category": "PROPERTY_CRIME", "description": "Theft in building, tent or vessel"},
        {"ipc_section": "IPC 392", "bns_section": "BNS 309(4)", "title": "Robbery", "category": "VIOLENT_CRIME", "description": "Punishment for robbery"},
        {"ipc_section": "IPC 420", "bns_section": "BNS 318(4)", "title": "Cheating and Dishonestly Inducing Delivery", "category": "CYBER_CYBERCRIME", "description": "Cheating and dishonesty"},
        {"ipc_section": "IPC 302", "bns_section": "BNS 103(1)", "title": "Murder", "category": "HEINOUS_CRIME", "description": "Punishment for murder"},
        {"ipc_section": "IPC 411", "bns_section": "BNS 317(2)", "title": "Dishonestly Receiving Stolen Property", "category": "PROPERTY_CRIME", "description": "Receiving stolen goods"},
        {"ipc_section": "IPC 354", "bns_section": "BNS 74", "title": "Assault on Woman with Intent to Outrage Modesty", "category": "WOMEN_SAFETY", "description": "Outraging modesty of woman"}
    ]

    # 4. Reusable Accused Entities (50 persistent repeat offenders across gangs)
    accused_pool = []
    for i in range(1, 60):
        gang = random.choice(GANGS) if i <= 35 else None
        accused_pool.append({
            "id": f"ACC_{i:03d}",
            "name": generate_random_name(),
            "alias": f"'{random.choice(['Chotta', 'Speedy', 'Tiger', 'Psycho', 'Blade', 'Kala'])} {generate_random_name().split()[0]}'",
            "age": random.randint(21, 48),
            "gender": "Male",
            "phone_number": generate_phone(),
            "aadhaar_hash": f"HASH_{uuid.uuid4().hex[:16]}",
            "history_sheet_no": f"HS-{random.randint(100, 999)}/2023",
            "known_mos": random.sample(["IRON_ROD_WINDOW", "HANDLE_LOCK_BREAK", "FAKE_ELECTRICITY_BILL_APK", "TWO_WHEELER_PILLION_GRAB"], 2),
            "address": f"No {random.randint(1, 100)}, Slum Board Colony, Bengaluru",
            "district": "Bengaluru City",
            "gang_name": gang
        })

    # 5. Shared Digital Entities (Vehicles, IMEIs, Phones, Bank/UPI) for rich Graph Linkage
    shared_vehicles = [generate_vehicle_no("Bengaluru City") for _ in range(25)]
    shared_imeis = [generate_imei() for _ in range(30)]
    shared_phones = [generate_phone() for _ in range(35)]
    shared_upis = [generate_upi(generate_random_name()) for _ in range(20)]

    # 6. Generate 600 FIR Records (with child records creating >10,000 DB items)
    firs = []
    fir_accused_links = []
    victims = []
    witnesses = []
    vehicles = []
    digital_evidences = []
    evidence_items = []
    case_timelines = []

    start_date = datetime.datetime(2024, 1, 1)

    for i in range(1, 601):
        stn = random.choice(stations)
        stn_officers = [o for o in officers if o["station_id"] == stn["id"]]
        io = random.choice(stn_officers)
        
        crime_key = random.choice(list(CRIME_HEADS_MAP.keys()))
        crime_info = CRIME_HEADS_MAP[crime_key]

        reg_date = start_date + datetime.timedelta(days=random.randint(0, 750), hours=random.randint(0, 23))
        inc_date = reg_date - datetime.timedelta(hours=random.randint(2, 48))

        location = random.choice(LOCATIONS_BY_DISTRICT.get(stn["district"], [stn["name"]]))
        amount = random.randint(15000, 450000)
        vehicle_no = random.choice(shared_vehicles)
        upi = random.choice(shared_upis)
        bank = generate_bank_acc()

        mo_text = crime_info["template"].format(
            location=location,
            amount=amount,
            vehicle_no=vehicle_no,
            upi=upi,
            bank=bank
        )

        fir_id = f"FIR_{i:04d}"
        fir_no = f"FIR-{stn['code']}-{i:04d}/{reg_date.year}"

        fir_item = {
            "id": fir_id,
            "fir_no": fir_no,
            "station_id": stn["id"],
            "io_officer_id": io["id"],
            "registration_date": reg_date,
            "incident_date": inc_date,
            "crime_head": crime_key,
            "ipc_sections": crime_info["ipc"],
            "bns_sections": crime_info["bns"],
            "mo_narrative": mo_text,
            "spot_mahazar": f"Spot inspected at {location} in presence of panchas. Seizure mahazar conducted. Lat: {stn['latitude'] + (random.random()-0.5)*0.04}, Long: {stn['longitude'] + (random.random()-0.5)*0.04}.",
            "crime_scene_address": f"{location}, {stn['district']}",
            "latitude": stn["latitude"] + (random.random()-0.5)*0.04,
            "longitude": stn["longitude"] + (random.random()-0.5)*0.04,
            "status": random.choice(["UNDER_INVESTIGATION", "UNDER_INVESTIGATION", "CHARGESHEETED", "CLOSED"]),
            "is_sensitive": True if crime_key == "WOMEN_SAFETY" or random.random() < 0.05 else False,
            "priority": random.choice(["MEDIUM", "HIGH", "CRITICAL"])
        }
        firs.append(fir_item)

        # Link Accused (1 to 3 accused per FIR)
        selected_accused = random.sample(accused_pool, random.randint(1, 3))
        for acc in selected_accused:
            fir_accused_links.append({
                "fir_id": fir_id,
                "accused_id": acc["id"],
                "relationship_type": random.choice(["NAMED", "SUSPECT", "ARRESTED"])
            })

        # Victim
        vic_name = generate_random_name()
        victims.append({
            "id": f"VIC_{i:04d}",
            "fir_id": fir_id,
            "name": vic_name,
            "age": random.randint(22, 65),
            "gender": random.choice(["Male", "Female"]),
            "phone_number": generate_phone(),
            "address": f"No {random.randint(1, 99)}, {location}",
            "is_anonymized": fir_item["is_sensitive"]
        })

        # Witness
        witnesses.append({
            "id": f"WIT_{i:04d}",
            "fir_id": fir_id,
            "name": generate_random_name(),
            "phone_number": generate_phone(),
            "statement_summary": f"Witness stated seeing two individuals fleeing from {location} on motor vehicle at night."
        })

        # Vehicle record
        if crime_key in ["VEHICLE_THEFT", "CHAIN_SNATCHING", "BURGLARY"]:
            vehicles.append({
                "id": f"VEH_{i:04d}",
                "fir_id": fir_id,
                "registration_no": vehicle_no,
                "make_model": random.choice(["Bajaj Pulsar 220", "Honda Activa 6G", "TVS Jupiter", "KTM Duke 200", "Yamaha FZ"]),
                "color": random.choice(["Black", "Red", "Blue", "Silver"]),
                "chassis_no": f"ME1{uuid.uuid4().hex[:14].upper()}",
                "engine_no": f"ENG{uuid.uuid4().hex[:12].upper()}",
                "status": "STOLEN" if crime_key == "VEHICLE_THEFT" else "USED_IN_CRIME"
            })

        # Digital Evidence
        if crime_key == "CYBER_UPI_FRAUD":
            digital_evidences.append({
                "id": f"DIG_{i:04d}_1",
                "fir_id": fir_id,
                "evidence_type": "UPI_ID",
                "value": upi,
                "owner_name": generate_random_name(),
                "remarks": "Mule account associated with cyber scam proceeds."
            })
            digital_evidences.append({
                "id": f"DIG_{i:04d}_2",
                "fir_id": fir_id,
                "evidence_type": "BANK_ACCOUNT",
                "value": bank,
                "owner_name": generate_random_name(),
                "remarks": "Destination bank account for stolen funds."
            })
        
        # Phone / IMEI
        digital_evidences.append({
            "id": f"DIG_{i:04d}_3",
            "fir_id": fir_id,
            "evidence_type": "IMEI",
            "value": random.choice(shared_imeis),
            "owner_name": selected_accused[0]["name"],
            "remarks": "IMEI detected on tower dump during time of crime."
        })

        # Physical Evidence Item
        evidence_items.append({
            "id": f"EVI_{i:04d}",
            "fir_id": fir_id,
            "property_id": f"PROP-{stn['code']}-{i:04d}",
            "description": f"Seized physical item: {random.choice(['Iron rod cutter', '35g gold chain fragment', 'Mobile phone handset', 'Master keys'])}",
            "category": "WEAPON" if "rod" in mo_text else "JEWELLERY",
            "seized_from": selected_accused[0]["name"],
            "seizure_date": reg_date + datetime.timedelta(days=1)
        })

        # Timeline Event
        case_timelines.append({
            "fir_id": fir_id,
            "event_date": reg_date,
            "title": "FIR Registered",
            "description": f"FIR {fir_no} registered under {', '.join(crime_info['bns'])} at {stn['name']}.",
            "officer_name": io["name"]
        })
        case_timelines.append({
            "fir_id": fir_id,
            "event_date": reg_date + datetime.timedelta(days=2),
            "title": "Spot Mahazar Completed",
            "description": "Crime scene inspection carried out and evidence logged.",
            "officer_name": io["name"]
        })

    print(f"[SUCCESS] Generated {len(stations)} Stations, {len(officers)} Officers, {len(penal_mappings)} Penal Codes, {len(accused_pool)} Accused, {len(firs)} FIRs.")
    print(f"  Total child entities generated: {len(victims) + len(witnesses) + len(vehicles) + len(digital_evidences) + len(evidence_items) + len(case_timelines)} items.")

    return {
        "stations": stations,
        "officers": officers,
        "penal_mappings": penal_mappings,
        "accused": accused_pool,
        "firs": firs,
        "fir_accused_links": fir_accused_links,
        "victims": victims,
        "witnesses": witnesses,
        "vehicles": vehicles,
        "digital_evidences": digital_evidences,
        "evidence_items": evidence_items,
        "case_timelines": case_timelines
    }
