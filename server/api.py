from fastapi import FastAPI
import game_logic


app = FastAPI()
game = game_logic.Game()

@app.get('/board')
def board():
    return {'board': game.board()}