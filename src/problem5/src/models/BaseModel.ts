import { Model, QueryBuilder } from "objection";

class BaseModel extends Model {
  createdAt?: Date;
  updatedAt?: Date;

  static get modelPaths(): string[] {
    return [__dirname];
  }

  static get useLimitInFirst() {
    return true;
  }

  $beforeInsert() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  $beforeUpdate() {
    this.updatedAt = new Date();
  }
}

export default BaseModel;
