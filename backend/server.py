from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import io
import pandas as pd
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

security = HTTPBearer()

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    username: str
    role: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class Equipment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    numero_patrimonio: str
    numero_serie: str
    marca: str
    modelo: str
    tipo_equipamento: str
    departamento_atual: str
    responsavel_atual: Optional[str] = None
    termo_responsabilidade: Optional[str] = None  # Base64 PDF
    status: str = "Disponível"  # Disponível, Em uso, Emprestado, Manutenção, Baixado
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class EquipmentCreate(BaseModel):
    numero_patrimonio: str
    numero_serie: str
    marca: str
    modelo: str
    tipo_equipamento: str
    departamento_atual: str
    responsavel_atual: Optional[str] = None
    status: str = "Disponível"

class EquipmentUpdate(BaseModel):
    numero_serie: Optional[str] = None
    marca: Optional[str] = None
    modelo: Optional[str] = None
    tipo_equipamento: Optional[str] = None
    departamento_atual: Optional[str] = None
    responsavel_atual: Optional[str] = None
    status: Optional[str] = None

class LoanEquipment(BaseModel):
    numero_patrimonio: str

class Loan(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    data_emprestimo: str
    nome_solicitante: str
    departamento_solicitante: str
    data_prevista_devolucao: str
    data_devolucao_real: Optional[str] = None
    status_devolucao: str = "Pendente"  # Pendente, Devolvido, Atrasado
    equipments: List[str]  # Lista de números de patrimônio
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class LoanCreate(BaseModel):
    data_emprestimo: str
    nome_solicitante: str
    departamento_solicitante: str
    data_prevista_devolucao: str
    equipments: List[str]

class LoanReturn(BaseModel):
    data_devolucao_real: str

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    message: str
    type: str  # loan_created, loan_returned, loan_overdue
    read: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class EquipmentHistory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    equipment_id: str
    action: str
    description: str
    user: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Helper Functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def create_notification(user_id: str, message: str, notification_type: str):
    notification = Notification(
        user_id=user_id,
        message=message,
        type=notification_type
    )
    await db.notifications.insert_one(notification.model_dump())

async def create_history_entry(equipment_id: str, action: str, description: str, user: str):
    history = EquipmentHistory(
        equipment_id=equipment_id,
        action=action,
        description=description,
        user=user
    )
    await db.equipment_history.insert_one(history.model_dump())

# Initialize default admin user
async def init_db():
    existing_user = await db.users.find_one({"username": "dedianit"})
    if not existing_user:
        hashed_password = bcrypt.hashpw("diadema123".encode('utf-8'), bcrypt.gensalt())
        user = {
            "id": str(uuid.uuid4()),
            "username": "dedianit",
            "password": hashed_password.decode('utf-8'),
            "role": "admin"
        }
        await db.users.insert_one(user)
        logger.info("Default admin user created")

# Auth Routes
@api_router.post("/auth/login", response_model=TokenResponse)
async def login(user_login: UserLogin):
    user = await db.users.find_one({"username": user_login.username}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not bcrypt.checkpw(user_login.password.encode('utf-8'), user["password"].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user["id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "role": user["role"]
        }
    }

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

# Equipment Routes
@api_router.post("/equipments", response_model=Equipment)
async def create_equipment(equipment: EquipmentCreate, current_user: dict = Depends(get_current_user)):
    # Check if patrimonio already exists
    existing = await db.equipments.find_one({"numero_patrimonio": equipment.numero_patrimonio})
    if existing:
        raise HTTPException(status_code=400, detail="Número de patrimônio já existe")
    
    equipment_obj = Equipment(**equipment.model_dump())
    await db.equipments.insert_one(equipment_obj.model_dump())
    
    await create_history_entry(
        equipment_obj.id,
        "created",
        f"Equipamento criado: {equipment.numero_patrimonio}",
        current_user["username"]
    )
    
    return equipment_obj

@api_router.get("/equipments", response_model=List[Equipment])
async def get_equipments(
    tipo: Optional[str] = None,
    departamento: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if tipo:
        query["tipo_equipamento"] = tipo
    if departamento:
        query["departamento_atual"] = departamento
    if status:
        query["status"] = status
    if search:
        query["$or"] = [
            {"numero_patrimonio": {"$regex": search, "$options": "i"}},
            {"numero_serie": {"$regex": search, "$options": "i"}},
            {"marca": {"$regex": search, "$options": "i"}},
            {"modelo": {"$regex": search, "$options": "i"}}
        ]
    
    equipments = await db.equipments.find(query, {"_id": 0}).to_list(1000)
    return equipments

@api_router.get("/equipments/{equipment_id}", response_model=Equipment)
async def get_equipment(equipment_id: str, current_user: dict = Depends(get_current_user)):
    equipment = await db.equipments.find_one({"id": equipment_id}, {"_id": 0})
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")
    return equipment

@api_router.put("/equipments/{equipment_id}", response_model=Equipment)
async def update_equipment(
    equipment_id: str,
    equipment_update: EquipmentUpdate,
    current_user: dict = Depends(get_current_user)
):
    equipment = await db.equipments.find_one({"id": equipment_id})
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")
    
    update_data = {k: v for k, v in equipment_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.equipments.update_one({"id": equipment_id}, {"$set": update_data})
    
    await create_history_entry(
        equipment_id,
        "updated",
        f"Equipamento atualizado",
        current_user["username"]
    )
    
    updated_equipment = await db.equipments.find_one({"id": equipment_id}, {"_id": 0})
    return updated_equipment

@api_router.delete("/equipments/{equipment_id}")
async def delete_equipment(equipment_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Apenas administradores podem deletar")
    
    result = await db.equipments.delete_one({"id": equipment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")
    
    return {"message": "Equipamento deletado com sucesso"}

@api_router.post("/equipments/{equipment_id}/upload-termo")
async def upload_termo(
    equipment_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    equipment = await db.equipments.find_one({"id": equipment_id})
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")
    
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Apenas arquivos PDF são permitidos")
    
    content = await file.read()
    base64_pdf = base64.b64encode(content).decode('utf-8')
    
    await db.equipments.update_one(
        {"id": equipment_id},
        {"$set": {"termo_responsabilidade": base64_pdf, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    await create_history_entry(
        equipment_id,
        "termo_uploaded",
        "Termo de responsabilidade anexado",
        current_user["username"]
    )
    
    return {"message": "Termo anexado com sucesso"}

@api_router.get("/equipments/{equipment_id}/history")
async def get_equipment_history(equipment_id: str, current_user: dict = Depends(get_current_user)):
    history = await db.equipment_history.find({"equipment_id": equipment_id}, {"_id": 0}).to_list(100)
    return history

# Loan Routes
@api_router.post("/loans", response_model=Loan)
async def create_loan(loan: LoanCreate, current_user: dict = Depends(get_current_user)):
    # Verify all equipments exist and are available
    for patrimonio in loan.equipments:
        equipment = await db.equipments.find_one({"numero_patrimonio": patrimonio})
        if not equipment:
            raise HTTPException(status_code=404, detail=f"Equipamento {patrimonio} não encontrado")
        if equipment["status"] == "Emprestado":
            raise HTTPException(status_code=400, detail=f"Equipamento {patrimonio} já está emprestado")
    
    loan_obj = Loan(**loan.model_dump())
    await db.loans.insert_one(loan_obj.model_dump())
    
    # Update equipment status
    for patrimonio in loan.equipments:
        await db.equipments.update_one(
            {"numero_patrimonio": patrimonio},
            {"$set": {"status": "Emprestado", "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        equipment = await db.equipments.find_one({"numero_patrimonio": patrimonio})
        await create_history_entry(
            equipment["id"],
            "loaned",
            f"Emprestado para {loan.nome_solicitante}",
            current_user["username"]
        )
    
    # Create notification
    await create_notification(
        current_user["id"],
        f"Empréstimo criado: {loan.nome_solicitante} - {len(loan.equipments)} equipamento(s)",
        "loan_created"
    )
    
    return loan_obj

@api_router.get("/loans", response_model=List[Loan])
async def get_loans(
    status_devolucao: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if status_devolucao:
        query["status_devolucao"] = status_devolucao
    if search:
        query["$or"] = [
            {"nome_solicitante": {"$regex": search, "$options": "i"}},
            {"departamento_solicitante": {"$regex": search, "$options": "i"}}
        ]
    
    loans = await db.loans.find(query, {"_id": 0}).to_list(1000)
    
    # Check for overdue loans
    current_date = datetime.now(timezone.utc)
    for loan in loans:
        if loan["status_devolucao"] == "Pendente":
            data_prevista = datetime.fromisoformat(loan["data_prevista_devolucao"])
            if current_date > data_prevista:
                await db.loans.update_one(
                    {"id": loan["id"]},
                    {"$set": {"status_devolucao": "Atrasado"}}
                )
                loan["status_devolucao"] = "Atrasado"
    
    return loans

@api_router.get("/loans/{loan_id}", response_model=Loan)
async def get_loan(loan_id: str, current_user: dict = Depends(get_current_user)):
    loan = await db.loans.find_one({"id": loan_id}, {"_id": 0})
    if not loan:
        raise HTTPException(status_code=404, detail="Empréstimo não encontrado")
    return loan

@api_router.put("/loans/{loan_id}/return")
async def return_loan(loan_id: str, loan_return: LoanReturn, current_user: dict = Depends(get_current_user)):
    loan = await db.loans.find_one({"id": loan_id})
    if not loan:
        raise HTTPException(status_code=404, detail="Empréstimo não encontrado")
    
    if loan["status_devolucao"] == "Devolvido":
        raise HTTPException(status_code=400, detail="Empréstimo já devolvido")
    
    await db.loans.update_one(
        {"id": loan_id},
        {"$set": {
            "data_devolucao_real": loan_return.data_devolucao_real,
            "status_devolucao": "Devolvido"
        }}
    )
    
    # Update equipment status back to available
    for patrimonio in loan["equipments"]:
        await db.equipments.update_one(
            {"numero_patrimonio": patrimonio},
            {"$set": {"status": "Disponível", "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        equipment = await db.equipments.find_one({"numero_patrimonio": patrimonio})
        await create_history_entry(
            equipment["id"],
            "returned",
            f"Devolvido por {loan['nome_solicitante']}",
            current_user["username"]
        )
    
    # Create notification
    await create_notification(
        current_user["id"],
        f"Empréstimo devolvido: {loan['nome_solicitante']} - {len(loan['equipments'])} equipamento(s)",
        "loan_returned"
    )
    
    return {"message": "Empréstimo devolvido com sucesso"}

# Notifications Routes
@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(current_user: dict = Depends(get_current_user)):
    notifications = await db.notifications.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return notifications

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user["id"]},
        {"$set": {"read": True}}
    )
    return {"message": "Notificação marcada como lida"}

# Export Routes
@api_router.get("/export/equipments")
async def export_equipments(current_user: dict = Depends(get_current_user)):
    equipments = await db.equipments.find({}, {"_id": 0}).to_list(1000)
    
    df = pd.DataFrame(equipments)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Equipamentos')
    output.seek(0)
    
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=equipamentos.xlsx"}
    )

@api_router.get("/export/equipments/template")
async def export_equipment_template(current_user: dict = Depends(get_current_user)):
    """Export an Excel template for equipment import"""
    template_data = {
        "numero_patrimonio": ["PAT-001", "PAT-002"],
        "numero_serie": ["SN123456", "SN789012"],
        "marca": ["Dell", "HP"],
        "modelo": ["Latitude 5420", "EliteBook 840"],
        "tipo_equipamento": ["Notebook", "Notebook"],
        "departamento_atual": ["SEINTEC", "PROTOCOLO"],
        "responsavel_atual": ["João Silva", "Maria Santos"],
        "status": ["Disponível", "Disponível"]
    }
    
    df = pd.DataFrame(template_data)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Equipamentos')
    output.seek(0)
    
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=template_equipamentos.xlsx"}
    )

@api_router.post("/import/equipments")
async def import_equipments(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Import equipments from Excel file"""
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Apenas arquivos Excel (.xlsx, .xls) são permitidos")
    
    try:
        # Read Excel file
        content = await file.read()
        df = pd.read_excel(io.BytesIO(content))
        
        # Required columns
        required_columns = [
            "numero_patrimonio", "numero_serie", "marca", "modelo",
            "tipo_equipamento", "departamento_atual", "status"
        ]
        
        # Check if all required columns exist
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Colunas obrigatórias faltando: {', '.join(missing_columns)}"
            )
        
        # Process each row
        success_count = 0
        error_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Check if patrimonio already exists
                existing = await db.equipments.find_one({
                    "numero_patrimonio": str(row["numero_patrimonio"])
                })
                
                if existing:
                    errors.append(f"Linha {index + 2}: Patrimônio {row['numero_patrimonio']} já existe")
                    error_count += 1
                    continue
                
                # Create equipment object
                equipment_data = {
                    "numero_patrimonio": str(row["numero_patrimonio"]),
                    "numero_serie": str(row["numero_serie"]),
                    "marca": str(row["marca"]),
                    "modelo": str(row["modelo"]),
                    "tipo_equipamento": str(row["tipo_equipamento"]),
                    "departamento_atual": str(row["departamento_atual"]),
                    "responsavel_atual": str(row.get("responsavel_atual", "")) if pd.notna(row.get("responsavel_atual")) else None,
                    "status": str(row.get("status", "Disponível"))
                }
                
                equipment_obj = Equipment(**equipment_data)
                await db.equipments.insert_one(equipment_obj.model_dump())
                
                # Create history entry
                await create_history_entry(
                    equipment_obj.id,
                    "created",
                    f"Equipamento importado via Excel: {equipment_data['numero_patrimonio']}",
                    current_user["username"]
                )
                
                success_count += 1
                
            except Exception as e:
                errors.append(f"Linha {index + 2}: {str(e)}")
                error_count += 1
        
        return {
            "message": "Importação concluída",
            "success_count": success_count,
            "error_count": error_count,
            "errors": errors[:10] if errors else []  # Return first 10 errors
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao processar arquivo: {str(e)}")

@api_router.get("/export/loans")
async def export_loans(current_user: dict = Depends(get_current_user)):
    loans = await db.loans.find({}, {"_id": 0}).to_list(1000)
    
    # Convert equipment arrays to strings
    for loan in loans:
        loan['equipments'] = ', '.join(loan['equipments'])
    
    df = pd.DataFrame(loans)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Empréstimos')
    output.seek(0)
    
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=emprestimos.xlsx"}
    )

# Dashboard Stats
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    total_equipments = await db.equipments.count_documents({})
    available = await db.equipments.count_documents({"status": "Disponível"})
    loaned = await db.equipments.count_documents({"status": "Emprestado"})
    maintenance = await db.equipments.count_documents({"status": "Manutenção"})
    
    active_loans = await db.loans.count_documents({"status_devolucao": "Pendente"})
    overdue_loans = await db.loans.count_documents({"status_devolucao": "Atrasado"})
    
    return {
        "total_equipments": total_equipments,
        "available": available,
        "loaned": loaned,
        "maintenance": maintenance,
        "active_loans": active_loans,
        "overdue_loans": overdue_loans
    }

# Public Routes (No authentication required)
@api_router.get("/public/equipments/available", response_model=List[Equipment])
async def get_available_equipments_public():
    """Public endpoint to get available equipments for loan requests"""
    equipments = await db.equipments.find(
        {"status": "Disponível"},
        {"_id": 0}
    ).to_list(1000)
    return equipments

@api_router.post("/public/loan-request", response_model=Loan)
async def create_public_loan_request(loan: LoanCreate):
    """Public endpoint for users to request equipment loans"""
    # Verify all equipments exist and are available
    for patrimonio in loan.equipments:
        equipment = await db.equipments.find_one({"numero_patrimonio": patrimonio})
        if not equipment:
            raise HTTPException(status_code=404, detail=f"Equipamento {patrimonio} não encontrado")
        if equipment["status"] == "Emprestado":
            raise HTTPException(status_code=400, detail=f"Equipamento {patrimonio} já está emprestado")
    
    loan_obj = Loan(**loan.model_dump())
    await db.loans.insert_one(loan_obj.model_dump())
    
    # Update equipment status
    for patrimonio in loan.equipments:
        await db.equipments.update_one(
            {"numero_patrimonio": patrimonio},
            {"$set": {"status": "Emprestado", "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        equipment = await db.equipments.find_one({"numero_patrimonio": patrimonio})
        await create_history_entry(
            equipment["id"],
            "loaned",
            f"Emprestado para {loan.nome_solicitante} (Solicitação Pública)",
            "Sistema - Solicitação Pública"
        )
    
    # Create notification for admin users
    admin_users = await db.users.find({"role": "admin"}, {"_id": 0}).to_list(100)
    for admin in admin_users:
        await create_notification(
            admin["id"],
            f"Nova solicitação de empréstimo: {loan.nome_solicitante} - {len(loan.equipments)} equipamento(s)",
            "loan_created"
        )
    
    return loan_obj

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await init_db()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()