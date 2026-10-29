from pydantic import BaseModel, ConfigDict


class EmployeeBase(BaseModel):
    name: str
    role: str
    qualification: str
    work_hours: str


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeOut(EmployeeBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
