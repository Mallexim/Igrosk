from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
import uuid

from typing import List, Tuple
import game_logic


app = FastAPI()

rooms = {}
# game = game_logic.Game()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Room(BaseModel):
    room_id: str
    game: game_logic.Game

    # Websocket addresses for players
    connections: List[WebSocket] = []

    class Config:
        arbitrary_types_allowed = True

    @validator('game')
    def validate_game(cls, v):
        if not isinstance(v, game_logic.Game):
            raise ValueError('Value must be an instance of game_logic.Game')
        return v

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
                while True:
                    # Receive data from player's WebSocket connection
                    data = await websocket.receive_text()
                    # Parse data
                    # Update game state
                    # Broadcast new game state to all players in room
            except:
                room.connections.remove(websocket)
    else:
        await websocket.close(code=1008)

@app.get("/test")
def hello():
    return {"message": "Hello, World!"}

# @app.get('/board')
# async def board():
#     return {'board': game.board}


# @app.post("/add-drop")
# async def add_drop(x: int, y: int):
#     game.add_drop(int(x), int(y))


# @app.post("/add_shift")
# async def add_shift(n: int, d: List):
#     game.add_shift(n, d)
