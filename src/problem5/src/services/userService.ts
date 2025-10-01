import User from "../models/User.js";
import { transformPaginate } from "../utils/index.js";
import type { FilterOpts, SortOpts } from "./filterService.js";
import FilterService from "./filterService.js";

export class UserService {
  getUserById(userId: number) {
    return User.query().where("id", userId).whereNull("deletedAt").first();
  }

  async getUsers(
    filterOps: FilterOpts[] = [],
    sortOpts: SortOpts[] = [{ field: "id", value: "desc" }],
    page = 1,
    pageSize = 10
  ) {
    const query = User.query().whereNull("deletedAt");

    const filterService = new FilterService(new User());

    filterService.filterJson(query, filterOps);
    filterService.sortJson(query, sortOpts);

    const results = await query.page(page - 1, pageSize);

    return transformPaginate({
      results: results.results,
      total: results.total,
      page,
      pageSize
    });
  }

  async createUser(data: Partial<User>) {
    const newUser = await User.query().insertAndFetch(data);
    return newUser;
  }

  async updateUser(userId: number, data: Partial<User>) {
    const updatedUser = await User.query().patchAndFetchById(userId, data);
    return updatedUser;
  }

  async deleteUser(userId: number) {
    const deletedRows = await User.query().deleteById(userId);
    return deletedRows > 0;
  }
}

export default new UserService();
