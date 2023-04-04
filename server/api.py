from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import uuid

from typing import List, Tuple
import game_logic


app = FastAPI()

rooms = {}
game = game_logic.Game()


class Room(BaseModel):
    room_id: str
    game: game_logic.Game

    # Websocket addresses for players
    connections: List[WebSocket] = []

    async def broadcast(self, message: str):
        # Method for broadcasting data to players
        for connection in self.connections:
            await connection.send_text(message)

    async def add_player(self, websocket: WebSocket):
        if len(self.connections) < 2:
            self.connections.append(websocket)
            await websocket.accept()
            return True
        else:
            await websocket.close(code=1008)
            return False


@app.post("/create_room")
async def create_room():
    room_id = str(uuid.uuid4())[:8]
    new_room = Room(room_id=room_id, game=game_logic.Game())
    rooms[room_id] = new_room
    return {"room_id": room_id, "message": f"Room {room_id} created"}


@app.websocket("/room/{room_id}")
async def join_room(websocket: WebSocket, room_id: str):
    if room_id in rooms:
        room = rooms[room_id]
        success = await room.add_player(websocket)
        if success:
            try:
                # Something here
                return {"message": f"Joined room {room_id}"}
            except:
                room.connections.remove(websocket)

    else:
        await websocket.close(code=1008)


@app.websocket("/game/{room_id}/{player_id}")
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
    game.add_drop(int(x), int(y))


@app.post("/add_shift")
async def add_shift(n: int, d: List):
    game.add_shift(n, d)
