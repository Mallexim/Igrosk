from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse

from typing import List, Tuple
import game_logic


app = FastAPI()
games = {}
game = game_logic.Game()

@app.websocket("/game/{game_id}/{player_id}")
async def ws_endpoint(websocket: WebSocket, game_id: str, player_id: str):
    await websocket.accept()
    if game_id not in games:
        games[game_id] = game_logic.Game()
    if player_id == 'white':
        games[game_id].white_ws = websocket
    else:
        games[game_id].black_ws = websocket

@app.get('/board')
async def board():
    return {'board': game.board}

@app.post("/add-drop")
async def add_drop(x: int, y: int):
    game.add_drop(int(x),int(y))

@app.post("/add_shift")
async def add_shift(n, d):
    game.add_shift(int(n), [int(x) for x in d.split(",")])