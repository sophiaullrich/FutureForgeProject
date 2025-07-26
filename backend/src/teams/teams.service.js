const { v4: uuidv4 } = require('uuid');

class TeamService {
  constructor() {
    this.teams = [];
  }

  create(teamDto) {
    if (!teamDto.name || !teamDto.description || !Array.isArray(teamDto.members)) {
      throw { status: 400, message: "Invalid team data" };
    }

    const newTeam = {
      id: uuidv4(),
      name: teamDto.name,
      description: teamDto.description,
      members: teamDto.members,
    };

    this.teams.push(newTeam);
    return newTeam;
  }

  findAll() {
    return this.teams;
  }

  findById(id) {
    const team = this.teams.find(t => t.id === id);
    if (!team) throw { status: 404, message: "Team not found" };
    return team;
  }

  delete(id) {
    const index = this.teams.findIndex(t => t.id === id);
    if (index === -1) throw { status: 404, message: "Team not found" };
    this.teams.splice(index, 1);
  }
}

module.exports = new TeamService();
