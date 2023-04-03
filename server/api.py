from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse

from typing import List, Tuple
import game_logic


app = FastAPI()

rooms = {}
game = game_logic.Game()

class Room:
    def __init__(self, room_id):
        self.room_id = room_id
        self.game = game_logic.Game()

        # Websocket addresses for players
        self.white_ws = None
        self.black_ws = None

@app.websocket("/game/{game_id}/{player_id}")
async def ws_endpoint(websocket: WebSocket, room_id: str, player_id: str):
    await websocket.accept()
    if room_id not in rooms:
        rooms[room_id] = game_logic.Game()
    if player_id == 'white':
        rooms[room_id].white_ws = websocket
    else:
        rooms[room_id].black_ws = websocket

@app.get('/board')
async def board():
    return {'board': game.board}

@app.post("/add-drop")
async def add_drop(x: int, y: int):
    game.add_drop(int(x),int(y))

@app.post("/add_shift")
async def add_shift(n, d):
    game.add_shift(int(n), [int(x) for x in d.split(",")])