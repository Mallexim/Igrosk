"""This file contains the game logic for Igrosk"""

White, Black = False, True
Up, Down, Left, Right = (-1, 0), (1, 0), (0, -1), (0, 1)


class Game:
    def __init__(self, log=[], board=[[[] for _ in range(6)] for _ in range(6)]):
        """
        Initializes a new game object.
        """
        # Validate the starting position:
        # Count the difference of white and black pieces, it has to be either 1 or 0
        count = 0
        for rank in board:
            for tower in rank:
                for piece in tower:
                    if piece == White:
                        count += 1
                    elif piece == Black:
                        count -= 1
                    else:
                        raise Exception("Invalid piece type")
        if count in (0, 1):
            self.board = board
            if count == 0:
                self.curr_player = White
            else:
                self.curr_player = Black
        else:
            raise Exception(
                "Invalid starting board: difference between white and black pieces is "+str(count))
        # Reset some variables
        self.curr_board_states = [self.board_state()]
        self.reset_turn(reset_board=True)
        self.log = []
        # Add logged turns one by one
        for turn in log:
            self.add_turn(turn)

        # Websocket addresses for players
        self.white_ws = None
        self.black_ws = None

    def reset_turn(self, reset_board=True):
        """
        Resets the turn and updates all relevant variables.

        Parameters:
        - reset_board (bool): whether or not to reset the game board to its initial state

        Returns:
        None
        """
        self.curr_turn = []
        self.curr_square = None
        self.curr_board_states = self.curr_board_states[:1]
        self.curr_turn_end = False
        if reset_board:
            self.board = list(list(list(tower) for tower in rank)
                            for rank in self.curr_board_states[0])
            # Same thing with list comprehensions
            # self.board = [[[piece for piece in tower] for tower in rank] for rank in self.curr_board_states[0]]


    def board_state(self):
        """
        Returns the current board state as a tuple of tuples of tuples, where each tuple of tuples represents a row on the board, and each tuple represents a stack of pieces in that row.
        """
        return tuple(tuple(tuple(tower) for tower in rank) for rank in self.board)


    def is_legal_drop(self, x, y):
        """
        Checks if a given position is a legal position to drop a new piece.
        Returns True if the position is either empty or has a tower with height < 4 where the top piece is of the current player's color.
        """
        t = self.board[x][y]
        return len(t) == 0 or (len(t) < 4 and t[-1] == self.curr_player)


    def is_legal_shift(self, n, d):
        """
        Checks if moving n pieces in direction d is a legal move.

        Args:
            n (int): The number of pieces to be moved.
            d (Tuple[int, int]): A tuple representing the direction to move in, with elements being -1, 0, or 1.

        Returns:
            bool: True if the move is legal, False otherwise.
        """
        # First fail case: not enough pieces of the same colour
        x, y = self.curr_square
        last_n = self.board[x][y][-n:]
        if len(last_n) < n or (not self.curr_player) in last_n:
            return False
        nx, ny = x+d[0], y+d[1]
        # Second fail case: moving off the board
        if -1 in (nx, ny) or 6 in (nx, ny):
            return False
        # Third fail case: the new tower is taller than the old
        if len(self.board[nx][ny])+n > len(self.board[x][y]):
            return False
        # Fourth fail case: if there are no pieces left at previous square
        if self.curr_turn_end:
            return False
        # Fifth fail case: the new position has already happened this turn
        self.board[x][y] = self.board[x][y][:-n]
        self.board[nx][ny] += [self.curr_player]*n
        bs = self.board_state()
        self.board[nx][ny] = self.board[nx][ny][:-n]
        self.board[x][y] += [self.curr_player]*n
        if bs in self.curr_board_states:
            return False
        return True


    def legal_moves(self):
        """Returns a list of all legal moves for the current player.

        If no piece has been dropped yet, returns a list of all positions
        where it is legal to drop a new piece.

        Otherwise, returns a list of all legal tower+direction combinations
        that the player can move in this turn, as long as there was a piece
        left at the previous square.

        Returns:
            list: A list of legal moves. Each move is represented by a tuple,
            where the first element is either a tuple representing the position
            where a piece should be dropped, or an integer representing the
            number of pieces to move, and the second element is either None
            (if dropping a piece), or a tuple representing the direction of the
            move (if moving a tower).
        """
        lm = []
        # If no piece has been dropped yet, find all positions
        # where it is legal to drop a new piece.
        if self.curr_square is None:
            for x in range(6):
                for y in range(6):
                    if self.is_legal_drop(x, y):
                        lm.append(((x, y), None))
        # Otherwise, find all legal towers+directions to move the towers,
        # as long as the turn can continue (i.e. there was a piece left
        # at the previous square)
        elif not self.curr_turn_end:
            for n in range(1, 5):
                for d in (Up, Down, Left, Right):
                    if self.is_legal_shift(n, d):
                        lm.append((n, d))
        return lm


    def add_drop(self, x, y):
        """Adds the first step of a turn: drop a new piece at (x,y).

        If the specified position is not a legal move, raises an exception.

        Args:
            x (int): The x-coordinate of the square to drop a piece on.
            y (int): The y-coordinate of the square to drop a piece on.

        Raises: Exception if the move is not legal
        """
        if self.is_legal_drop(x, y):
            self.board[x][y].append(self.curr_player)
            self.curr_square = (x, y)
            self.curr_turn.append((x, y))
            self.curr_board_states.append(self.board_state())
        else:
            raise Exception(str((x, y))+" is not a legal move")


    def add_shift(self, n, d):
        """
        Adds a stage of a turn: move n pieces in the given direction.
        If the move is legal, the pieces are moved and the game state is updated.

        Parameters:
        - self: the game object
        - n: the number of pieces to move
        - d: the direction to move the pieces in

        Returns: None

        Raises: Exception if the move is not legal
        """
        if self.is_legal_shift(n, d):
            x, y = self.curr_square
            # If there was no piece left at the previous square,
            # the turn will be forced to end after this move
            self.board[x][y] = self.board[x][y][:-n]
            if len(self.board[x][y]) == 0 or not self.board[x][y][-1] == self.curr_player:
                self.curr_turn_end = True
            x, y = x+d[0], y+d[1]
            self.board[x][y] += [self.curr_player]*n
            self.curr_square = (x, y)
            self.curr_turn.append((n, d))
            self.curr_board_states.append(self.board_state())
        else:
            raise Exception(str((n, d))+" is not a legal move")

        def undo_move(self):
            # Undo a move, reset the turn if undoing a drop
            if len(self.curr_turn) == 1:
                self.reset_turn(reset_board=True)
            else:
                x, y = self.curr_square
                n, d = self.curr_turn[-1]
                self.board[x][y] = self.board[x][y][:-n]
                self.curr_turn_end = False
                x, y = x-d[0], y-d[1]
                self.board[x][y] += [self.curr_player]*n
                self.curr_square = (x, y)
                del self.curr_turn[-1]
                del self.curr_board_states[-1]


    def undo_move(self):
        """
        Undoes the last move made by the player.
        If the last move was a drop, resets the turn completely.
        """
        if len(self.curr_turn) == 1:
            self.reset_turn(reset_board=True)
        else:
            x, y = self.curr_square
            n, d = self.curr_turn[-1]
            self.board[x][y] = self.board[x][y][:-n]
            self.curr_turn_end = False
            x, y = x-d[0], y-d[1]
            self.board[x][y] += [self.curr_player]*n
            self.curr_square = (x, y)
            del self.curr_turn[-1]
            del self.curr_board_states[-1]


    def end_turn(self):
        """
        Ends the current turn and switches to the other player.
        """
        self.curr_board_states = [self.board_state()]
        self.curr_player = not self.curr_player
        self.log.append(self.curr_turn)
        self.reset_turn(reset_board=False)


    def add_turn(self, turn):
        """
        Adds a new turn to the game, consisting of one or more moves.

        Raises:
        - Exception: if the end flag is raised before the end of the turn or if the turn is invalid.
        """
        self.add_drop(*turn[0])
        for move in turn[1:]:
            self.add_shift(*move)
            if self.curr_turn_end == True and len(turn) > len(self.curr_turn):
                raise Exception(f"Invalid turn #{len(self.log)}, end flag raised")
        self.end_turn()

    def winner(self):
        """
        Determines the winner of the game by checking if one player has control of all four corners of the board.

        Returns:
            - None if no player has control of all four corners.
            - The color of the player who controls all four corners.
        """
        corners = [[0, 0], [0, 5], [5, 0], [5, 5]]
        tops = []
        for corner in corners:
            x, y = corner
            if len(self.board[x][y]) == 0:
                return None
            elif len(self.board[x][y]) == 4:
                continue
            else:
                p = self.board[x][y][-1]
                tops.append(p)
        if all(x == tops[0] for x in tops):
            return tops[0]
        else:
            return None
