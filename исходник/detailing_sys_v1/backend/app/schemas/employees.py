from pydantic import BaseModel


class EmployeeBase(BaseModel):
    name: str
    role: str
    qualification: str
    work_hours: str


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeOut(EmployeeBase):
    id: int

    class Config:
        orm_mode = True
