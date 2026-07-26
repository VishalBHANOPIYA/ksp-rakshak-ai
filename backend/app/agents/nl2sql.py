import re
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text

try:
    from groq import Groq
except ImportError:
    Groq = None

from app.core.config import settings

class NL2SQLAgent:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY) if (Groq and settings.GROQ_API_KEY) else None

    def execute_nl2sql(self, user_query: str, db: Session) -> Dict[str, Any]:
        """Translates natural language (Kannada/English) into validated, safe SQL and executes it."""
        schema_context = """
        Database Schema:
        - police_stations (id, code, name, district, range_zone, latitude, longitude)
        - fir_records (id, fir_no, station_id, registration_date, crime_head, ipc_sections, bns_sections, mo_narrative, status, priority, is_sensitive, latitude, longitude)
        - accused_persons (id, name, alias, age, gender, phone_number, history_sheet_no, known_mos, district, gang_name)
        - fir_accused_links (fir_id, accused_id, relationship_type)
        - vehicles (id, fir_id, registration_no, make_model, color, status)
        - digital_evidence (id, fir_id, evidence_type, value, owner_name, remarks)
        """

        prompt = f"""
        You are an expert SQL Generator for Karnataka State Police CCTNS database (SQLite/PostgreSQL compatible).
        User Query: "{user_query}"

        {schema_context}

        Rules:
        1. Output ONLY a valid SELECT SQL query. No markdown formatting, no explanations.
        2. Query must be strictly READ-ONLY (SELECT only). Never use INSERT, UPDATE, DELETE, DROP.
        3. Match crime_head values: 'BURGLARY', 'VEHICLE_THEFT', 'CYBER_UPI_FRAUD', 'CHAIN_SNATCHING', 'ARRAIGNED_ASSAULT'.
        4. For district filtering, match case-insensitively using LIKE '%Bengaluru%' or '%Mysuru%'.
        5. Return maximum 25 rows using LIMIT 25.

        SQL Query:
        """

        raw_sql = ""
        try:
            if self.client:
                response = self.client.chat.completions.create(
                    model=settings.FAST_MODEL,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.1,
                    max_tokens=300
                )
                raw_sql = response.choices[0].message.content.strip()
                raw_sql = re.sub(r'```sql|```', '', raw_sql).strip()
            else:
                # Rule-based fallback if Groq API key is not configured
                raw_sql = self._rule_based_sql_fallback(user_query)

            # Safety Validation
            if not self._is_safe_sql(raw_sql):
                return {"sql": raw_sql, "results": [], "error": "Unsafe SQL statement rejected"}

            # Execution
            result_proxy = db.execute(text(raw_sql))
            keys = result_proxy.keys()
            rows = [dict(zip(keys, row)) for row in result_proxy.fetchall()]

            return {
                "sql": raw_sql,
                "results": rows[:25],
                "row_count": len(rows),
                "error": None
            }

        except Exception as e:
            # Fallback retry query on exception
            fallback_sql = "SELECT f.fir_no, f.crime_head, s.name as station_name, s.district, f.registration_date FROM fir_records f JOIN police_stations s ON f.station_id = s.id LIMIT 10"
            try:
                result_proxy = db.execute(text(fallback_sql))
                keys = result_proxy.keys()
                rows = [dict(zip(keys, row)) for row in result_proxy.fetchall()]
                return {"sql": fallback_sql, "results": rows, "row_count": len(rows), "error": str(e)}
            except Exception as ex:
                return {"sql": "", "results": [], "row_count": 0, "error": str(ex)}

    def _is_safe_sql(self, sql: str) -> bool:
        forbidden = ["INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "CREATE", "TRUNCATE", "EXEC", "--"]
        sql_upper = sql.upper()
        if not sql_upper.startswith("SELECT"):
            return False
        for word in forbidden:
            if f" {word} " in f" {sql_upper} ":
                return False
        return True

    def _rule_based_sql_fallback(self, query: str) -> str:
        q_lower = query.lower()
        if "chain snatching" in q_lower or "chain" in q_lower:
            return "SELECT f.fir_no, f.crime_head, s.name as station_name, s.district, f.registration_date FROM fir_records f JOIN police_stations s ON f.station_id = s.id WHERE f.crime_head = 'CHAIN_SNATCHING' LIMIT 15"
        elif "vehicle" in q_lower or "bike" in q_lower or "theft" in q_lower:
            return "SELECT f.fir_no, f.crime_head, s.name as station_name, s.district, f.registration_date FROM fir_records f JOIN police_stations s ON f.station_id = s.id WHERE f.crime_head = 'VEHICLE_THEFT' LIMIT 15"
        elif "burglary" in q_lower or "house" in q_lower:
            return "SELECT f.fir_no, f.crime_head, s.name as station_name, s.district, f.registration_date FROM fir_records f JOIN police_stations s ON f.station_id = s.id WHERE f.crime_head = 'BURGLARY' LIMIT 15"
        else:
            return "SELECT f.fir_no, f.crime_head, s.name as station_name, s.district, f.registration_date FROM fir_records f JOIN police_stations s ON f.station_id = s.id ORDER BY f.registration_date DESC LIMIT 15"

# Global Instance
nl2sql_agent = NL2SQLAgent()
