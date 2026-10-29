from app.database import SessionLocal, engine
from sqlalchemy import text

def fix_missing_columns():
    print("🔧 Fixing missing columns...")
    
    db = SessionLocal()
    try:
        # Проверяем, существует ли столбец duration в таблице services
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='services' AND column_name='duration'
        """))
        
        if not result.fetchone():
            print("📝 Adding 'duration' column to services table...")
            db.execute(text("ALTER TABLE services ADD COLUMN duration INTEGER"))
            print("✅ Column 'duration' added successfully")
        else:
            print("✅ Column 'duration' already exists")
        
        # Проверяем другие возможные отсутствующие столбцы
        columns_to_check = [
            ('services', 'image'),
            ('services', 'is_active'),
            ('services', 'updated_at'),
            ('inventory_items', 'min_stock'),
            ('inventory_items', 'cost'),
            ('inventory_items', 'last_updated'),
            ('appointments', 'status'),
            ('appointments', 'employee_id'),
            ('appointments', 'updated_at'),
            ('appointments', 'service_name'),
            ('appointments', 'price')
        ]
        
        for table, column in columns_to_check:
            result = db.execute(text(f"""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='{table}' AND column_name='{column}'
            """))
            
            if not result.fetchone():
                print(f"📝 Adding '{column}' column to {table} table...")
                
                if column == 'duration':
                    db.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} INTEGER"))
                elif column in ['price', 'cost', 'min_stock']:
                    db.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} FLOAT"))
                elif column == 'service_name':
                    db.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} VARCHAR DEFAULT ''"))
                elif column in ['is_active']:
                    db.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} BOOLEAN DEFAULT true"))
                elif column in ['last_updated', 'updated_at']:
                    db.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
                else:
                    db.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} VARCHAR"))
                
                print(f"✅ Column '{column}' added to {table}")
            else:
                print(f"✅ Column '{column}' already exists in {table}")
        
        db.commit()
        print("🎉 All missing columns fixed successfully!")
        
    except Exception as e:
        print(f"❌ Error fixing columns: {e}")
        db.rollback()
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_missing_columns()
