from typing import Any, List, Dict, TypedDict

def tsSum(a: int, b: int) -> int:
    """This function returns the sum of two numbers"""
    ...

def tsSum2(a: Any, b: Any) -> Any:
    ...

def analyzeNumbers(numbers: List[int]) -> ReturnType0Wrapper:
    ...

def sum2(a: int, b: str) -> int:
    """Adds a number and a string that is parsed to a number"""
    ...

def sum3(a: int, b: int, c: int) -> int:
    ...


class ReturnType0(TypedDict):
    sorted: List[int]
    sum: int
    average: int
    median: int

class ReturnType0Wrapper:
    def __init__(self, data: ReturnType0):
        self.__data = data

    def __getattr__(self, key: str) -> Any:
        return self.__data[key]

    def __getitem__(self, key: str) -> Any:
        return self.__data[key]

    def __repr__(self):
        return repr(self.__data)