from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.loyalty_transactions import LoyaltyTransaction
from app.models.clients import Client
from app.schemas.loyalty_transactions import LoyaltyTransaction as LoyaltyTransactionSchema, LoyaltyTransactionCreate

router = APIRouter(prefix="/api/loyalty", tags=["loyalty"])

@router.get("/transactions/{client_id}", response_model=List[LoyaltyTransactionSchema])
def get_client_loyalty_transactions(client_id: str, db: Session = Depends(get_db)):
    transactions = db.query(LoyaltyTransaction).filter(LoyaltyTransaction.client_id == client_id).order_by(LoyaltyTransaction.created_at.desc()).all()
    return transactions

@router.post("/transactions", response_model=LoyaltyTransactionSchema)
def create_loyalty_transaction(transaction: LoyaltyTransactionCreate, db: Session = Depends(get_db)):
    # Verify client exists
    client = db.query(Client).filter(Client.id == transaction.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # Update client loyalty points
    if transaction.transaction_type == 'earn':
        client.loyalty_points += transaction.points
    elif transaction.transaction_type == 'spend':
        if client.loyalty_points < transaction.points:
            raise HTTPException(status_code=400, detail="Insufficient loyalty points")
        client.loyalty_points -= transaction.points
    else:
        raise HTTPException(status_code=400, detail="Invalid transaction type")

    db_transaction = LoyaltyTransaction(**transaction.model_dump())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    db.refresh(client)
    return db_transaction

@router.get("/balance/{client_id}")
def get_client_loyalty_balance(client_id: str, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"loyalty_points": client.loyalty_points, "total_visits": client.total_visits, "total_spent": client.total_spent}