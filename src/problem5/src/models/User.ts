import BaseModel from "./BaseModel.js";
import _ from "lodash";

class User extends BaseModel {
  id!: number;
  email!: string;
  password!: string;
  fullName!: string;
  birthday?: Date;
  phone?: string;
  address?: string;
  status?: number;
  deletedAt?: Date;

  get $secureFields(): string[] {
    return ["password"];
  }

  static get tableName() {
    return "users";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["email", "password", "fullName"],
      properties: {
        id: { type: "integer" },
        email: { type: "string", minLength: 1, maxLength: 255 },
        password: { type: "string", minLength: 1, maxLength: 255 },
        fullName: { type: "string", minLength: 1, maxLength: 255 },
        birthday: { type: ["string", "null"], format: "date" },
        phone: { type: ["string", "null"], minLength: 1, maxLength: 20 },
        address: { type: ["string", "null"], minLength: 1, maxLength: 500 },
        status: { type: ["integer", "null"] },
        deletedAt: { type: ["string", "null"], format: "date-time" },
        createdAt: { type: ["string", "null"], format: "date-time" },
        updatedAt: { type: ["string", "null"], format: "date-time" }
      }
    };
  }

  $formatJson(json: Record<string, any>): Record<string, any> {
    json = super.$formatJson(json);
    return _.omit(json, this.$secureFields);
  }
}

export default User;
