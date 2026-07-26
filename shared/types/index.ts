export type UserRole = 
  | 'CONSTABLE' 
  | 'SHO_PSI' 
  | 'DYSP_CI' 
  | 'SP_DCP' 
  | 'CID_INVESTIGATOR' 
  | 'STATE_SCRB_ADMIN';

export interface UserProfile {
  id: string;
  badgeNumber: string;
  name: string;
  role: UserRole;
  stationId: string;
  stationName: string;
  district: string;
  clearanceLevel: number;
}

export interface PoliceStation {
  id: string;
  code: string;
  name: string;
  district: string;
  range: string;
  lat: number;
  lng: number;
  contactNumber: string;
}

export interface FIRRecord {
  firId: string;
  firNo: string;
  stationId: string;
  stationName: string;
  district: string;
  registrationDate: string;
  crimeHead: string;
  ipcSections: string[];
  bnsSections: string[];
  moNarrative: string;
  spotMahazar: string;
  status: 'PENDING' | 'UNDER_INVESTIGATION' | 'CHARGESHEETED' | 'CLOSED';
  isSensitive: boolean; // POCSO, Sexual assault, etc.
}

export interface AccusedPerson {
  accusedId: string;
  name: string;
  alias: string;
  age: number;
  gender: string;
  phoneNumber: string;
  aadhaarHash: string;
  historySheetNo?: string;
  knownMOs: string[];
  address: string;
  city: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'ACCUSED' | 'FIR' | 'PHONE' | 'VEHICLE' | 'STATION' | 'LOCATION';
  details: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  label: string;
  weight?: number;
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface CitationBadge {
  firId: string;
  firNo: string;
  stationName: string;
  date: string;
  crimeHead: string;
  relevanceScore: number;
}

export interface AgentChatMessage {
  id: string;
  sender: 'USER' | 'SYSTEM' | 'AGENT';
  text: string;
  kannadaText?: string;
  timestamp: string;
  queryType?: 'NL2SQL' | 'GRAPH_RAG' | 'VECTOR_RAG' | 'HYBRID';
  graphData?: KnowledgeGraphData;
  citations?: CitationBadge[];
  sqlQueryExecuted?: string;
  executionTimeMs?: number;
  confidenceScore?: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  query: string;
  recordsAccessedCount: number;
  hash: string;
  previousHash: string;
}
