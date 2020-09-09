import mongoose from 'mongoose';

class Database {
  public mongoConnection =
    'mongodb+srv://teste:teste@cluster0.9fkne.gcp.mongodb.net/formatador?retryWrites=true&w=majority';

  constructor() {
    this.mongo();
  }

  private mongo(): void {
    mongoose.connect(this.mongoConnection, {
      useNewUrlParser: true,
      useFindAndModify: true,
      useUnifiedTopology: true,
    });
  }
}

export default new Database();
