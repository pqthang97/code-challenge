import BaseModel from "../models/BaseModel.js";

export interface FilterOpts {
  field: string;
  operator: string;
  value: any;
}

export interface SortOpts {
  field: string;
  value: "asc" | "desc";
}

export interface QueryBuilder {
  orderBy(field: string, direction: "asc" | "desc"): QueryBuilder;
  where(field: string, value?: any): QueryBuilder;
  where(field: string, operator: string, value: any): QueryBuilder;
  where(callback: (qb: QueryBuilder) => void): QueryBuilder;
  orWhere(callback: (qb: QueryBuilder) => void): QueryBuilder;
  whereIn(field: string, values: any[]): QueryBuilder;
  whereNotIn(field: string, values: any[]): QueryBuilder;
  whereNull(field: string): QueryBuilder;
  whereNotNull(field: string): QueryBuilder;
  whereNot(field: string, operator: string, value: any): QueryBuilder;
  whereRaw(sql: string, bindings?: any): QueryBuilder;
}

export default class FilterService<T extends BaseModel> {
  protected model: T;
  constructor(model: T) {
    this.model = model;
  }

  sortJson(_query: QueryBuilder, sorts: SortOpts[]): void {
    if (sorts?.length > 0) {
      try {
        sorts.forEach((item) => {
          _query.orderBy(item.field, item.value);
        });
      } catch (e) {
        console.log(e);
        throw new Error("WRONG_INPUT_SORT");
      }
    }
  }

  filterJson(_query: QueryBuilder, filter: FilterOpts[]): void {
    if (filter?.length > 0) {
      try {
        filter.forEach((item) => {
          this.buildWhereClause(_query, item);
        });
      } catch (e) {
        throw new Error("WRONG_INPUT_FILTER");
      }
    }
  }

  buildWhereClause(qb: QueryBuilder, { field, operator, value }: FilterOpts) {
    if (Array.isArray(value) && !["or", "in", "nin"].includes(operator)) {
      return qb.where((subQb: QueryBuilder) => {
        for (const val of value) {
          subQb.orWhere((q: QueryBuilder) =>
            this.buildWhereClause(q, { field, operator, value: val })
          );
        }
      });
    }

    switch (operator) {
      case "or":
        return qb.where((orQb: QueryBuilder) => {
          value.forEach((orClause: any) => {
            orQb.orWhere((subQb: QueryBuilder) => {
              if (Array.isArray(orClause)) {
                orClause.forEach((orClause: any) =>
                  subQb.where((andQb: QueryBuilder) =>
                    this.buildWhereClause(andQb, { ...orClause })
                  )
                );
              } else {
                this.buildWhereClause(subQb, { ...orClause });
              }
            });
          });
        });
      case "eq":
        return qb.where(field, value);
      case "ne":
        return qb.where(field, "!=", value);
      case "lt":
        return qb.where(field, "<", value);
      case "lte":
        return qb.where(field, "<=", value);
      case "gt":
        return qb.where(field, ">", value);
      case "gte":
        return qb.where(field, ">=", value);
      case "in":
        return qb.whereIn(field, Array.isArray(value) ? value : [value]);
      case "nin":
        return qb.whereNotIn(field, Array.isArray(value) ? value : [value]);
      case "ina":
        return qb.whereRaw(`? = ANY(${field})`, value);
      case "contains":
        return qb.whereRaw("LOWER(??) LIKE LOWER(?)", [field, `%${value}%`]);
      case "ncontains":
        return qb.whereRaw("LOWER(??) NOT LIKE LOWER(?)", [
          field,
          `%${value}%`
        ]);
      case "containss":
        return qb.where(field, "ilike", `%${value}%`);
      case "ilike":
        return qb.where(field, "ilike", `%${value}%`);
      case "ncontainss":
        return qb.whereNot(field, "ilike", `%${value}%`);
      case "null": {
        return value ? qb.whereNull(field) : qb.whereNotNull(field);
      }

      default:
        throw new Error(
          `Unhandled whereClause : ${field} ${operator} ${value}`
        );
    }
  }
}
