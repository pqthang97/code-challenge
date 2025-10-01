export const transformPaginate = <T>(data: {
  results: T[];
  total: number;
  page: number;
  pageSize: number;
}) => {
  return {
    data: data.results,
    pagination: {
      total: data.total,
      page: data.page + 1,
      pageSize: data.pageSize
    }
  };
};
