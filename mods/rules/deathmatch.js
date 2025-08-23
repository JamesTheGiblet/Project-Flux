export default {
  name: "Deathmatch",
  checkWinCondition(state) {
    return state.players.filter(p => p.alive).length <= 1;
  }
};