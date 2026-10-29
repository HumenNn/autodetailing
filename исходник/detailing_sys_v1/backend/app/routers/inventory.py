from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import InventoryItem, InventoryTransaction
from app.schemas import (
    InventoryItemResponse,
    InventoryItemCreate,
    InventoryItemUpdate,
    InventoryTransactionCreate,
    InventoryTransactionResponse,
)

router = APIRouter(prefix="", tags=["inventory"])

@router.get("/inventory", response_model=list[InventoryItemResponse])
def get_inventory_items(db: Session = Depends(get_db)):
    """
    Возвращает все материалы с остатков в БД.
    """
    return db.query(InventoryItem).order_by(InventoryItem.name).all()

@router.get("/inventory/low-stock", response_model=list[InventoryItemResponse])
def get_low_stock_items(db: Session = Depends(get_db)):
    """
    Материалы с остатком ниже или равным минимальному порогу.
    Используется для блока \"Низкий запас\" в админ-панели.
    """
    return (
        db.query(InventoryItem)
        .filter(InventoryItem.quantity <= InventoryItem.min_stock)
        .order_by(InventoryItem.name)
        .all()
    )

@router.post("/inventory", response_model=InventoryItemResponse)
def create_inventory_item(item: InventoryItemCreate, db: Session = Depends(get_db)):
    """
    Создание нового материала в инвентаре.
    """
    db_item = InventoryItem(
        name=item.name,
        description=item.description,
        sku=item.sku,
        quantity=item.quantity,
        min_stock=item.min_stock,
        unit=item.unit,
        last_updated=datetime.utcnow(),
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/inventory/{item_id}", response_model=InventoryItemResponse)
def update_inventory_item(
    item_id: int,
    item_update: InventoryItemUpdate,
    db: Session = Depends(get_db),
):
    """
    Обновление полей материала (в том числе количества и минимального запаса).
    """
    db_item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")

    data = item_update.dict(exclude_unset=True)

    if "quantity" in data:
        db_item.quantity = data.pop("quantity")
        db_item.last_updated = datetime.utcnow()

    if "name" in data:
        db_item.name = data.pop("name")
    if "description" in data:
        db_item.description = data.pop("description")
    if "min_stock" in data:
        db_item.minimum_threshold = data.pop("min_stock")
    if "cost" in data:
        # cost хранится в отдельной модели InventoryItem из inventory.py, но в основной модели
        # его нет; игнорируем это поле для избежания ошибок.
        data.pop("cost")

    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/inventory/{item_id}")
def delete_inventory_item(item_id: int, db: Session = Depends(get_db)):
    """
    Удаление материала из справочника.
    """
    db_item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(db_item)
    db.commit()
    return {"message": "Item deleted successfully"}


@router.post(
    "/inventory/{item_id}/transactions",
    response_model=InventoryTransactionResponse,
)
def create_inventory_transaction(
    item_id: int,
    tx: InventoryTransactionCreate,
    db: Session = Depends(get_db),
):
    """
    Регистрирует движение материала (приход/расход/корректировка) и обновляет остаток.
    Может быть использовано позже, но само изменение остатков сейчас делаем через PUT.
    """
    db_item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")

    db_tx = InventoryTransaction(
        inventory_item_id=item_id,
        change_amount=tx.change_amount,
        transaction_type=tx.transaction_type,
        reason=tx.reason,
        performed_by=None,
    )
    db_item.quantity += tx.change_amount
    db_item.last_updated = datetime.utcnow()

    db.add(db_tx)
    db.commit()
    db.refresh(db_tx)
    return db_tx
