from fastapi import FastAPI
from typing import List, Tuple
import game_logic


app = FastAPI()
game = game_logic.Game()


@app.get('/board')
async def board():
    return {'board': game.board}

@app.post("/add-drop")
async def add_drop(x: int, y: int):
    game.add_drop(int(x),int(y))

@app.post("/add_shift")
async def add_shift(n, d):
    game.add_shift(int(n), [int(x) for x in d.split(",")])