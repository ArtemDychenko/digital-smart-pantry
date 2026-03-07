export interface SearchResult<T> {
  result: T[];
  total: number;
}

export function listToSearchResult<T>(list: T[]): SearchResult<T> {
  return {
    result: list,
    total: list.length,
  };
}

export function searchResultToModel<TDto, T>(
  searchResult: SearchResult<TDto>,
  toModel: (dto: TDto) => T,
): SearchResult<T> {
  return {
    result: searchResult.result.map((dto) => toModel(dto)),
    total: searchResult.total,
  };
}
