from typing import Any, List, Dict, TypedDict

def tsSum(a: float | int, b: float | int) -> float | int:
    """This function returns the sum of two numbers"""
    ...

def tsSum2(a: Any, b: Any) -> Any:
    ...

def analyzeNumbers(numbers: List[int]) -> ReturnType0Wrapper:
    ...

def sum2(a: float | int, b: str) -> float | int:
    """Adds a number and a string that is parsed to a number"""
    ...

def sum3(a: float | int, b: float | int, c: float | int) -> float | int:
    ...


class ReturnType0(TypedDict):
    sorted: List[int]
    sum: float | int
    average: float | int
    median: float | int

class ReturnType0Wrapper:
    def __init__(self, data: ReturnType0):
        self.__data = data

    def __getattr__(self, key: str) -> Any:
        return self.__data[key]

    def __getitem__(self, key: str) -> Any:
        return self.__data[key]

    def __repr__(self):
        return repr(self.__data)