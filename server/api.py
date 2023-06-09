from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
import uuid
import json

from typing import List, Tuple
import game_logic


app = FastAPI()

rooms = {}

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
        # Validator for the 'game' field
        if not isinstance(v, game_logic.Game):
            # Raise an error if the value is not an instance of game_logic.Game
            raise ValueError('Value must be an instance of game_logic.Game')
        return v

    async def broadcast(self, data: str):
        # Method for broadcasting data to players as JSON
        for connection in self.connections:
            # Send data to each player as a JSON string
            await connection.send_text(data)

    async def broadcast_game_state(self):
        """
        Sends the current game state to all connected clients.

        Returns:
            None
        """
        # Create a dictionary containing the game state
        game_state = {
            "type": "game_state",
            "active_player": self.game.curr_player,
            "board": self.game.board,
            "current_turn": self.game.log[-1],
            "winner": self.game.winner()
        }

        # Send the game state to all connected clients
        await self.broadcast(json.dumps(game_state))

    async def send_to_player(self, data: str, player: WebSocket):
        # Method for sending data to a player as JSON
        await player.send_text(json.dumps(data))

    async def add_player(self, websocket: WebSocket):
        # Method for adding a player to the game
        if len(self.connections) < 2:
            # If there are less than 2 players, add the new player
            self.connections.append(websocket)
            await websocket.accept()
            await self.send_to_player({"type": "initialisation", "player": self.connections.index(websocket)}, websocket)
            return True
        else:
            # If there are already 2 players, close the connection
            await websocket.close(code=1008)
            return False


class Drop(BaseModel):
    x: int
    y: int


class Shift(BaseModel):
    pieces: int
    direction: List[int]


class Turn(BaseModel):
    drop: Drop
    shifts: List[Shift]


@app.post("/create_room")
async def create_room():
    """
    Create a new room with a unique ID and game instance.

    This endpoint creates a new room with a unique ID generated using the uuid library.
    A new instance of the game_logic.Game class is also created and assigned to the room.
    The new room is then added to the 'rooms' dictionary and its ID is returned in the response.

    Returns:
        dict: A dictionary containing the room ID and a message indicating that the room was created.
    """
    room_id = str(uuid.uuid4())[:8]
    new_room = Room(room_id=room_id, game=game_logic.Game())
    rooms[room_id] = new_room

    # Log when a new room is created
    print(f"New room created with ID {room_id}")

    return {"room_id": room_id, "message": f"Room {room_id} created"}


@app.websocket("/room/{room_id}")
async def join_room(websocket: WebSocket, room_id: str):
    """
    Join a room with the specified ID.

    This endpoint allows a player to join a room with the specified ID using a WebSocket connection.
    If the room exists and has less than 2 players, the player is added to the room and can start sending and receiving data.
    If the room does not exist or is full, the WebSocket connection is closed.

    Args:
        websocket (WebSocket): The player's WebSocket connection.
        room_id (str): The ID of the room to join.

    """
    if room_id in rooms:
        room = rooms[room_id]
        success = await room.add_player(websocket)
        if success:
            # Log when a player joins a room
            print(f"Player {websocket} joined room {room_id}")
            try:
                while True:
                    # Receive data from player's WebSocket connection
                    data = json.loads(await websocket.receive_text())
                    print(data, type(data))
                    # Parse data
                    turn = data["turn"]
                    print(turn, type(turn))
                    # Add the turn to the game
                    room.game.add_turn(turn)
                    print(room.game.board)
                    # Broadcast new game state to all players in room
                    await room.broadcast_game_state()
            except:
                # Log when a player leaves a room
                print(f"Player {websocket} left room {room_id}")
                room.connections.remove(websocket)
    else:
        await websocket.close(code=1008)


@app.get("/test")
def hello():
    return {"message": "Hello, World!"}


@app.get("/room")
async def get_all_rooms():
    # Endpoint for getting all room keys
    # Returns a list of all room keys in the 'rooms' dictionary
    return list(rooms.keys())
