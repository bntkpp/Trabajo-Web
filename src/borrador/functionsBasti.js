
// Desde linea la 1064. Se mantuvo solo una funcion, para borrar la duplicacion de código, y se puso nombre más descriptivo.
function paginate(items, page, pageSize) {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    page,
    totalPages,
    totalItems,
    pageSize
  };
}

// Se eliminó la duplicación de código en las funciones de ordenamiento.
function sortByField(items, fieldName, sortOrder) {
  const direction = sortOrder === "asc" ? 1 : -1;

  return items.slice().sort((itemA, itemB) => {
    if (itemA[fieldName] < itemB[fieldName]) return -1 * direction;
    if (itemA[fieldName] > itemB[fieldName]) return 1 * direction;
    return 0;
  });
}
// Hasta linea 1136
