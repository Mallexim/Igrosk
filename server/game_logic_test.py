# %%
import unittest
import game_logic


class TestGameLogic(unittest.TestCase):

    def test_init(self):
        game = game_logic.Game()
        self.assertEqual(game.curr_player, game_logic.White)
        self.assertEqual(game.board, [[[]
                         for _ in range(6)] for _ in range(6)])
        self.assertEqual(game.curr_turn, [])
        self.assertEqual(game.curr_square, None)
        self.assertEqual(game.curr_board_states, [tuple(tuple(tuple(
            tower) for tower in rank) for rank in [[[] for _ in range(6)] for _ in range(6)])])
        self.assertEqual(game.log, [])