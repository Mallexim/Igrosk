White, Black = False, True
Up, Down, Left, Right = (-1,0), (1,0), (0,-1), (0,1)

class Game:
    def __init__(self, log=[], board=[[[] for _ in range(6)] for _ in range(6)]):
        #Validating the starting position:
        #count the difference of white and black pieces, it has to be either 1 or 0
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
        if count in (0,1):
            self.board = board
            if count == 0:
                self.curr_player = White
            else:
                self.curr_player = Black
        else:
            raise Exception("Invalid starting board: difference between white and black pieces is "+str(count))
        #Reset some variables
        self.curr_board_states = [self.board_state()]
        self.reset_turn(reset_board = True)
        self.log = []
        #Add logged turns one by one
        for turn in log:
            self.add_turn(turn)
    
    def reset_turn(self, reset_board = True):
        self.curr_turn = []
        self.curr_square = None
        self.curr_board_states = self.curr_board_states[:1]
        self.curr_turn_end = False
        if reset_board:
            self.board = list(list(list(tower) for tower in rank) for rank in self.curr_board_states[0])
    
    def board_state(self):
        return tuple(tuple(tuple(tower) for tower in rank) for rank in self.board)
    
    def is_legal_drop(self, x, y):
        #Checks if (x, y) is a legal position to drop a new piece
        #(empty square or tower of height < 4 where the top piece is of our colour)
        t = self.board[x][y]
        return len(t) == 0 or (len(t) < 4 and t[-1] == self.curr_player)
        
    def is_legal_move(self, n, d):
        #Checks if moving n pieces in direction d is legal
        #First fail case: not enough pieces of the same colour
        x, y = self.curr_square
        last_n = self[x][y][-n:]
        if len(last_n) < n or (not self.curr_player) in last_n:
            return False
        nx, ny = x+d[0], y+d[1]
        #Second fail case: moving off the board
        if -1 in (nx, ny) or 6 in (nx, ny):
            return False
        #Third fail case: the new tower is taller than the old
        if len(self.board[nx][ny])+n > len(self.board[x][y]):
            return False
        #Fourth fail case: the new position has already happened this turn
        self.board[x][y] = self.board[x][y][:-n]
        self.board[nx][ny] += [self.curr_player]*n
        bs = self.board_state()
        self.board[nx][ny] = self.board[nx][ny][:-n]
        self.board[x][y] += [self.curr_player]*n
        if bs in self.curr_board_states:
            return False
        return True
            

    def legal_moves(self):
        lm = []
        if self.curr_square == None:
            #Find all positions where it is legal to drop a new piece
            for x in range(6):
                for y in range(6):
                    if self.is_legal_drop(x,y):
                        lm.append((x,y))
        else:
            #Find all legal piles+directions to move the piles,
            #as long as the turn can continue (i.e. there was a piece left
            #at the previous square)
            if curr_turn_end:
                return []
            for n in range(1,5):
                for d in (Up,Down,Left,Right):
                    if self.is_legal_move(n,d):
                        lm.append((n,d))
        return lm
        
    def add_drop(self,x,y):
        #Add the first step of a turn: drop a new piece at (x,y)
        if self.is_legal_drop(x,y):
            self.board[x][y] += self.curr_player
            self.curr_square = (x,y)
            self.curr_turn.append((x,y))
            self.curr_board_states.append(self.board_state())
        else:
            raise Exception(str((x,y))+" is not a legal move")
    
    def add_move(self,n,d):
        #Add a stage of a turn: move n pieces in direction d
        if self.is_legal_move(n,d):
            x, y = self.curr_square
            self.board[x][y] = self.board[x][y][:-n]
            #If there was no piece left at the previous square,
            #the turn will be forced to end after this move
            if not self.board[x][y][-1] == self.curr_player:
                self.curr_turn_end = True
            x, y = x+d[0], y+d[1]
            self.board[x][y] += [self.curr_player]*n
            self.curr_square = (x,y)
            self.curr_turn.append((n,d))
            self.curr_board_states.append(self.board_state())
        else:
            Exception(str((n,d))+" is not a legal move")
            
    def undo_move(self):
        #Undo a move, reset the turn if undoing a drop
        if len(self.curr_turn) == 1:
            self.reset_turn(reset_board = True)
        else:
            x, y = self.curr_square
            n, d = self.curr_turn[-1]
            self.board[x][y] = self.board[x][y][:-n]
            self.curr_turn_end = False
            x, y = x-d[0], y-d[1]
            self.board[x][y] += [self.curr_player]*n
            self.curr_square = (x,y)
            del self.curr_turn[-1]
            del self.curr_board_states[-1]
            
    def end_turn(self):
        #End the turn
        self.curr_board_states = [self.board_state()]
        self.curr_player = not self.curr_player
        self.log.append(self.curr_turn)
        self.reset_turn(reset_board = False)
        
    def add_turn(self, turn):
        #Add turn
        self.add_drop(*turn[0])
        for move in turn[1:]:
            self.add_move(*move)
            if self.curr_turn_end == True and len(turn)>len(self.curr_turn):
                raise Exception("Invalid turn #"+str(len(log))+", end flag raised")
        self.end_turn()